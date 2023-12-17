import os
import numpy as np
from transformers import TrainerCallback
from transformers.integrations import is_tensorboard_available

def custom_rewrite_logs(d, mode):
    '''If you want to combine train and eval for other metrics besides the loss then custom_rewrite_logs should be modified accordingly.'''
    new_d = {}
    eval_prefix = "eval_"
    eval_prefix_len = len(eval_prefix)
    test_prefix = "test_"
    test_prefix_len = len(test_prefix)

    # we combine loss, accuracy, recall and f1

    for k, v in d.items():
        if mode == 'eval' and k.startswith(eval_prefix):
            if k[eval_prefix_len:] == 'loss':
                new_d["combined/" + k[eval_prefix_len:]] = v

            elif k[eval_prefix_len:] == 'accuracy':
                new_d["combined/" + k[eval_prefix_len:]] = v

            elif k[eval_prefix_len:] == 'recall':
                new_d["combined/" + k[eval_prefix_len:]] = v

            elif k[eval_prefix_len:] == 'f1':
                new_d["combined/" + k[eval_prefix_len:]] = v
            
        elif mode == 'test' and k.startswith(test_prefix):
            if k[test_prefix_len:] == 'loss':
                new_d["combined/" + k[test_prefix_len:]] = v

            elif k[test_prefix_len:] == 'accuracy':
                new_d["combined/" + k[test_prefix_len:]] = v

            elif k[test_prefix_len:] == 'recall':
                new_d["combined/" + k[test_prefix_len:]] = v    

            elif k[test_prefix_len:] == 'f1':
                new_d["combined/" + k[test_prefix_len:]] = v

        elif mode == 'train':
            if k == 'loss':
                new_d["combined/" + k] = v

            elif k == 'train_accuracy':
                new_d["combined/" + 'accuracy'] = v

            elif k == 'train_recall':
                new_d["combined/" + 'recall'] = v

            elif k == 'train_f1':
                new_d["combined/" + 'f1'] = v
                
    return new_d


class CombinedTensorBoardCallback(TrainerCallback):
    """
    A [`TrainerCallback`] that sends the logs to [TensorBoard](https://www.tensorflow.org/tensorboard).
    Args:
        tb_writer (`SummaryWriter`, *optional*):
            The writer to use. Will instantiate one if not set.
    """

    def __init__(self, tb_writers=None):
        has_tensorboard = is_tensorboard_available()
        if not has_tensorboard:
            raise RuntimeError(
                "TensorBoardCallback requires tensorboard to be installed. Either update your PyTorch version or"
                " install tensorboardX."
            )
        if has_tensorboard:
            try:
                from torch.utils.tensorboard import SummaryWriter  # noqa: F401

                self._SummaryWriter = SummaryWriter
            except ImportError:
                try:
                    from tensorboardX import SummaryWriter

                    self._SummaryWriter = SummaryWriter
                except ImportError:
                    self._SummaryWriter = None
        else:
            self._SummaryWriter = None
        self.tb_writers = tb_writers

    def _init_summary_writer(self, args, log_dir=None):
        log_dir = log_dir or args.logging_dir
        if self._SummaryWriter is not None:
            self.tb_writers = dict(train=self._SummaryWriter(log_dir=os.path.join(log_dir, 'train')),
                                   eval=self._SummaryWriter(log_dir=os.path.join(log_dir, 'eval')))

    def on_train_begin(self, args, state, control, **kwargs):
        if not state.is_world_process_zero:
            return

        log_dir = None

        if state.is_hyper_param_search:
            trial_name = state.trial_name
            if trial_name is not None:
                log_dir = os.path.join(args.logging_dir, trial_name)

        if self.tb_writers is None:
            self._init_summary_writer(args, log_dir)

        for k, tbw in self.tb_writers.items():
            tbw.add_text("args", args.to_json_string())
            if "model" in kwargs:
                model = kwargs["model"]
                if hasattr(model, "config") and model.config is not None:
                    model_config_json = model.config.to_json_string()
                    tbw.add_text("model_config", model_config_json)
            # Version of TensorBoard coming from tensorboardX does not have this method.
            if hasattr(tbw, "add_hparams"):
                tbw.add_hparams(args.to_sanitized_dict(), metric_dict={})

    def on_log(self, args, state, control, logs=None, **kwargs):
        if not state.is_world_process_zero:
            return

        if self.tb_writers is None:
            self._init_summary_writer(args)

        for tbk, tbw in self.tb_writers.items():
            logs_new = custom_rewrite_logs(logs, mode=tbk)
            for k, v in logs_new.items():
                if isinstance(v, (int, float)):
                    tbw.add_scalar(k, v, state.global_step)
                else:
                    logger.warning(
                        "Trainer is attempting to log a value of "
                        f'"{v}" of type {type(v)} for key "{k}" as a scalar. '
                        "This invocation of Tensorboard's writer.add_scalar() "
                        "is incorrect so we dropped this attribute."
                    )
            tbw.flush()

    def on_train_end(self, args, state, control, **kwargs):
        for tbw in self.tb_writers.values():
            tbw.close()
        self.tb_writers = None

import evaluate

metric_acc = evaluate.load("accuracy")
metric_recall = evaluate.load('recall')
metric_f1 = evaluate.load('f1')

def compute_metrics(eval_pred):
    logits, labels = eval_pred      # logits: an n*num_of_class array with probability, e.g. [[ 1.9851098, -1.6966375],[ 2.7240963, -2.372472 ],...], labels = true labels
    predictions = np.argmax(logits, axis=-1)
    acc = metric_acc.compute(predictions=predictions, references=labels)['accuracy']
    recall = metric_recall.compute(predictions=predictions, references=labels)['recall']
    f1_score = metric_f1.compute(predictions=predictions, references=labels, pos_label=1)['f1']
    # rocauc = metric_rocauc.compute(predictions=predictions, references=labels)['roc_auc']
    return {'accuracy': acc, "recall": recall, "f1": f1_score}



# override original trainer to add evaluation on training dataset as well

import math
import time
from typing import Dict, List, Optional
from transformers import Trainer
from transformers.trainer_utils import speed_metrics
from transformers.debug_utils import DebugOption
from transformers.utils import  is_torch_tpu_available
from datasets import Dataset

if is_torch_tpu_available(check_device=False):
    import torch_xla.core.xla_model as xm
    import torch_xla.debug.metrics as met

class MyTrainer(Trainer):
    def evaluate(self, 
                 eval_dataset: Optional[Dataset] = None,
                 ignore_keys: Optional[List[str]] = None,
                 metric_key_prefix: str = "eval"
                 ) -> Dict[str, float]:
        """
            Run evaluation and returns metrics.
            The calling script will be responsible for providing a method to compute metrics, as they are task-dependent
            (pass it to the init `compute_metrics` argument).
            You can also subclass and override this method to inject custom behavior.
            Args:
                eval_dataset (`Dataset`, *optional*):
                    Pass a dataset if you wish to override `self.eval_dataset`. If it is a [`~datasets.Dataset`], columns
                    not accepted by the `model.forward()` method are automatically removed. It must implement the `__len__`
                    method.
                ignore_keys (`Lst[str]`, *optional*):
                    A list of keys in the output of your model (if it is a dictionary) that should be ignored when
                    gathering predictions.
                metric_key_prefix (`str`, *optional*, defaults to `"eval"`):
                    An optional prefix to be used as the metrics key prefix. For example the metrics "bleu" will be named
                    "eval_bleu" if the prefix is "eval" (default)
            Returns:
                A dictionary containing the evaluation loss and the potential metrics computed from the predictions. The
                dictionary also contains the epoch number which comes from the training state.
            """
        # memory metrics - must set up as early as possible
        self._memory_tracker.start()

        eval_dataloader = self.get_eval_dataloader(eval_dataset)
        train_dataloader = self.get_train_dataloader()
        start_time = time.time()

        eval_loop = self.prediction_loop if self.args.use_legacy_prediction_loop else self.evaluation_loop
        eval_output = eval_loop(
            eval_dataloader,
            description="Evaluation",
            # No point gathering the predictions if there are no metrics, otherwise we defer to
            # self.args.prediction_loss_only
            prediction_loss_only=True if self.compute_metrics is None else None,
            ignore_keys=ignore_keys,
            metric_key_prefix=metric_key_prefix,
        )

        train_output = eval_loop(
            train_dataloader,
            description='Training Evaluation',
            prediction_loss_only=True if self.compute_metrics is None else None,
            ignore_keys=ignore_keys,
            metric_key_prefix="train",
        )

        total_batch_size = self.args.eval_batch_size * self.args.world_size
        if f"{metric_key_prefix}_jit_compilation_time" in eval_output.metrics:
            start_time += eval_output.metrics[f"{metric_key_prefix}_jit_compilation_time"]
        eval_output.metrics.update(
            speed_metrics(
                metric_key_prefix,
                start_time,
                num_samples=eval_output.num_samples,
                num_steps=math.ceil(eval_output.num_samples / total_batch_size),
            )
        )

        train_n_samples = len(self.train_dataset)
        train_output.metrics.update(speed_metrics('train', start_time, train_n_samples))
        self.log(train_output.metrics | eval_output.metrics)

        if DebugOption.TPU_METRICS_DEBUG in self.args.debug:
            # tpu-comment: Logging debug metrics for PyTorch/XLA (compile, execute times, ops, etc.)
            xm.master_print(met.metrics_report())

        self.control = self.callback_handler.on_evaluate(self.args, self.state, self.control, train_output.metrics)
        self.control = self.callback_handler.on_evaluate(self.args, self.state, self.control, eval_output.metrics)

        self._memory_tracker.stop_and_update_metrics(eval_output.metrics)
        self._memory_tracker.stop_and_update_metrics(train_output.metrics)

        # only works in Python >= 3.9
        return train_output.metrics | eval_output.metrics