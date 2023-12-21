from sklearn.metrics import confusion_matrix,classification_report
from sklearn.metrics import f1_score, accuracy_score, roc_auc_score

import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

def print_classification_report(y_true,y_pred):
    '''Create classification report including confusion matrix, accuracy, misclassification, F1-score and ROC-AUC score
    
    Args:
        y_true: true labels
        y_pred: predicted labels
    '''

    cfmat = confusion_matrix(y_true,y_pred)

    classification_report_dict = classification_report(y_true,y_pred, output_dict=True)

    print('Classification report: \n',classification_report(y_true,y_pred))
    print("\n")
    print('TN - True Negative {}'.format(cfmat[0,0]))
    print('FN - False Negative {}'.format(cfmat[1,0]))
    print('TP - True Positive {}'.format(cfmat[1,1]))
    print('FP - False Positive {}'.format(cfmat[0,1]))
    print('Accuracy Rate: {}'.format(np.divide(np.sum([cfmat[0,0],cfmat[1,1]]),np.sum(cfmat))))
    print('Misclassification Rate: {}'.format(np.divide(np.sum([cfmat[0,1],cfmat[1,0]]),np.sum(cfmat))))
    print('F1-Score: {}'.format(f1_score(y_true, y_pred,average='macro')))
    print('ROC-AUC {}'.format(roc_auc_score(y_true,y_pred)))

    return classification_report_dict

def create_classification_report_df(classification_report_dict, training_name):
    '''Create classification report dataframe
    
    Args:
        classification_report_dict: classification report dictionary
    '''

    # create a 1D dictionary from classification_report_dict
    classification_report_dict_1d = {}
    for key, value in classification_report_dict.items():
        if key == 'accuracy' or key == 'roc_auc':
            classification_report_dict_1d[key] = [value]
        else:
            for key2, value2 in value.items():
                classification_report_dict_1d[key + '-' + key2] = [value2]

    # create dataframe from classification_report_dict_1d
    classification_report_df = pd.DataFrame.from_dict(classification_report_dict_1d)

    # add a column to indicate which model is this classification report for
    classification_report_df['model'] = training_name

    # rearrange columns such that column 'model' is the first
    cols = list(classification_report_df)
    cols.insert(0, cols.pop(cols.index('model')))
    classification_report_df = classification_report_df.loc[:, cols]

    return classification_report_df


def create_confusion_matrix_graph(y_true, y_pred, title=None, save=False, save_filename=None, show=False):
    '''Create confusion matrix graph
    
    Args:
        y_true: true labels
        y_pred: predicted labels
        title: title of the graph
        save: whether to save the graph
        save_filename: filename to save the graph'''


    # pre checking
    if save and save_filename == None:
        print("save_filename camnot be empty, function exits.")
        return

    ax = sns.heatmap(confusion_matrix(y_true,y_pred),annot=True,fmt='')

    ax.set_title(title)
    ax.set_xlabel("predicted label")
    ax.set_ylabel('true label')
    ax.set_xticklabels(['[0]\nNegative', '[1]\nPositive'])
    ax.set_yticklabels(['Negative [0]', 'Positive [1]'])

    if save:
        plt.savefig(save_filename, dpi=600, facecolor='w', bbox_inches='tight')


# plot ROC curve for binary class classification
from sklearn.metrics import roc_curve, auc

def plot_roc_curve_binary(y_test, y_pred, title=None, save=False, save_filename=None, show=False):
    '''Plot ROC curve for binary class classification
    
    Args:
        y_test: true labels
        y_pred: predicted labels
        title: title of the graph
        save: whether to save the graph
        save_filename: filename to save the graph'''

    # pre-checking
    if save and save_filename == None:
        print('save_filename cannot be empty. Function exits.')
        return


    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    for i in range(2):
        fpr[i], tpr[i], _ = roc_curve(y_test, y_pred, pos_label=1)
        roc_auc[i] = auc(fpr[i], tpr[i])

    print(roc_auc_score(y_test, y_pred))
    plt.figure(dpi=600)
    plt.plot(fpr[0], tpr[0], label="ROC curve (area = {:0.4f})".format(roc_auc_score(y_test, y_pred)))

    # random-guess line
    plt.plot([0, 1], [0, 1], "k--")

    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(title if title else 'Receiver operating characteristic (ROC)')
    plt.legend(loc='lower right')

    if save:
        plt.savefig(save_filename, dpi=600, facecolor='w', bbox_inches='tight')

    # plt.show() should come AFTER than plt.savefig
    # as plt.show() clears the whole thing -> anything after wards will happen on a new blank figure
    if show:
        plt.show()



# ploting ROC curve for non-binary class classification

from sklearn.preprocessing import label_binarize
from itertools import cycle

def plot_roc_curve(y_test, y_pred, title=None, save=False, save_filename=None, show=False):
    '''Plot ROC curve for non-binary class classification
    From: https://stackoverflow.com/questions/70278059/plotting-the-roc-curve-for-a-multiclass-problem

    Args:
        y_test: true labels
        y_pred: predicted labels
        title: title of the graph
        save: whether to save the graph
        save_filename: filename to save the graph
    '''

    # pre-checking
    if save and save_filename == None:
        print('save_filename cannot be empty. Function exits.')
        return


    n_classes = len(np.unique(y_test))
    y_test = label_binarize(y_test, classes=np.arange(n_classes, dtype=int))

    # Compute ROC curve and ROC area for each class
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    thresholds = dict()
    
    if n_classes > 2:
      for i in range(n_classes):
        fpr[i], tpr[i], thresholds[i] = roc_curve(y_test[:, i], y_pred[:, i], drop_intermediate=False)
        roc_auc[i] = auc(fpr[i], tpr[i])
    else:
       for i in range(n_classes):
        fpr[i], tpr[i], thresholds[i] = roc_curve(y_test, y_pred, drop_intermediate=False)
        roc_auc[i] = auc(fpr[i], tpr[i])


    # Compute micro-average ROC curve and ROC area
    fpr["micro"], tpr["micro"], _ = roc_curve(y_test.ravel(), y_pred.ravel())
    roc_auc["micro"] = auc(fpr["micro"], tpr["micro"])

    # First aggregate all false positive rates
    all_fpr = np.unique(np.concatenate([fpr[i] for i in range(n_classes)]))

    # Then interpolate all ROC curves at this points
    mean_tpr = np.zeros_like(all_fpr)
    for i in range(n_classes):
      mean_tpr += np.interp(all_fpr, fpr[i], tpr[i])

    # Finally average it and compute AUC
    mean_tpr /= n_classes

    fpr["macro"] = all_fpr
    tpr["macro"] = mean_tpr
    roc_auc["macro"] = auc(fpr["macro"], tpr["macro"])

    # Plot all ROC curves
    #plt.figure(figsize=(10,5))
    plt.figure(dpi=600)
    lw = 2
    plt.plot(fpr["micro"], tpr["micro"],
    label="micro-average ROC curve (area = {0:0.2f})".format(roc_auc["micro"]),
    color="deeppink", linestyle=":", linewidth=4,)

    plt.plot(fpr["macro"], tpr["macro"],
    label="macro-average ROC curve (area = {0:0.2f})".format(roc_auc["macro"]),
    color="navy", linestyle=":", linewidth=4,)

    colors = cycle(["aqua", "darkorange", "darkgreen", "yellow", "blue"])
    for i, color in zip(range(n_classes), colors):
        plt.plot(fpr[i], tpr[i], color=color, lw=lw,
        label="ROC curve of class {0} (area = {1:0.2f})".format(i, roc_auc[i]),)

    plt.plot([0, 1], [0, 1], "k--", lw=lw)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    
    # plt.title("Receiver Operating Characteristic (ROC) curve")
    plt.title(title if title else "Receiver Operating Characteristic (ROC) curve")
    plt.legend()

    if save:
      plt.savefig(save_filename, dpi=600, facecolor='w', bbox_inches='tight')

    if show:
        plt.show()