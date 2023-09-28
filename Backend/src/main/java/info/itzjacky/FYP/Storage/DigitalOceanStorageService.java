package info.itzjacky.FYP.Storage;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DigitalOceanStorageService {

    private Logger logger = LoggerFactory.getLogger(DigitalOceanStorageService.class);

    @Autowired
    @Qualifier("doSpace")
    private AmazonS3 amazonS3Client;

    @Value("${do.space.bucket}")
    private String bucketName;

    @Value("${do.space.endpoint}")
    private String endpoint;

    /**
     * Upload file into DigitalOcean Spaces
     *
     * @param fileName
     * @param file
     * @return String
     */
    public String uploadFile(final String fileName, final MultipartFile file) {
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(contentType(file));
            metadata.setHeader("x-amz-acl", "public-read"); // publicly accessible, comment this to not publicly accessible
            PutObjectResult result = amazonS3Client.putObject(bucketName, fileName, file.getInputStream(), metadata);

            System.out.println("Content - Length in KB : " + result.getMetadata().getContentLength());

            return result.getETag();
        } catch (IOException ioe) {
            logger.error("IOException: " + ioe.getMessage());
        } catch (AmazonServiceException serviceException) {
            logger.info("AmazonServiceException: " + serviceException.getMessage());
            throw serviceException;
        } catch (AmazonClientException clientException) {
            logger.info("AmazonClientException Message: " + clientException.getMessage());
            throw clientException;
        }
        return null;
    }

    @Transactional
    public String findFileByName(String fileName) {
        try {
            S3Object s3object = amazonS3Client.getObject(new GetObjectRequest(bucketName, fileName));
            return s3object.getObjectContent().getHttpRequest().getURI().toString();
        } catch (AmazonServiceException serviceException) {
            logger.info("AmazonServiceException: " + serviceException.getMessage());
            throw serviceException;
        } catch (AmazonClientException clientException) {
            logger.info("AmazonClientException Message: " + clientException.getMessage());
            throw clientException;
        }
    }

    /**
     * Deletes file from DigitalOcean Spaces
     *
     * @param fileName
     * @return
     */
    public String deleteFile(final String fileName) {
        if(fileName.isEmpty()){
            throw new IllegalStateException("File name cannot be empty");
        }
        amazonS3Client.deleteObject(bucketName, fileName);
        return "Deleted File: " + fileName;
    }


    /**
     * Downloads file from DigitalOcean Spaces
     *
     * @param keyName
     * @return ByteArrayOutputStream
     */
    public ByteArrayOutputStream downloadFile(String keyName) {
        try {
            S3Object s3object = amazonS3Client.getObject(new GetObjectRequest(bucketName, keyName));

            InputStream is = s3object.getObjectContent();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            int len;
            byte[] buffer = new byte[4096];
            while ((len = is.read(buffer, 0, buffer.length)) != -1) {
                outputStream.write(buffer, 0, len);
            }

            return outputStream;
        } catch (IOException ioException) {
            logger.error("IOException: " + ioException.getMessage());
        } catch (AmazonServiceException serviceException) {
            logger.info("AmazonServiceException Message:    " + serviceException.getMessage());
            throw serviceException;
        } catch (AmazonClientException clientException) {
            logger.info("AmazonClientException Message: " + clientException.getMessage());
            throw clientException;
        }

        return null;
    }

    /**
     * Get all files from DO Spaces
     *
     * @return
     */
    public List<String> listFiles() {

//        ListObjectsV2Result files = amazonS3Client.listObjectsV2(bucketName);
//
//        List<String> result = new ArrayList<>();
//
//        for(S3ObjectSummary file : files.getObjectSummaries()) {
//            System.out.println(file.getKey());
//            result.add(file.getKey());
//        }

        ListObjectsRequest listObjectsRequest =
                new ListObjectsRequest().withBucketName(bucketName);

        List<String> files = new ArrayList<>();
        ObjectListing objects = amazonS3Client.listObjects(listObjectsRequest);

        logger.info(objects.toString());

        while (true) {
            List<S3ObjectSummary> objectSummaries = objects.getObjectSummaries();
            if (objectSummaries.isEmpty()) {
                break;
            }

            for (S3ObjectSummary item : objectSummaries) {
                if (!item.getKey().endsWith("/"))
                    files.add(item.getKey());
            }

            objects = amazonS3Client.listNextBatchOfObjects(objects);
        }

//        return result;
        return files;
    }


    private String contentType(final MultipartFile file) {

        final String fileName = file.getOriginalFilename();
        return file.getContentType() == null ? fileName.substring(fileName.lastIndexOf(".") + 1) : file.getContentType();
    }
}