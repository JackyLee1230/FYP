package info.itzjacky.FYP.Storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    @Autowired
    DigitalOceanStorageService service;

    @PostMapping("/getAllFiles")
    public List<String> getAllFiles() {
        return service.listFiles();
    }



}
