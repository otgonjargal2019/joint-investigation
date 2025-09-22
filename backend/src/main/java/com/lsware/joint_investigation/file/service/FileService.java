package com.lsware.joint_investigation.file.service;

import java.io.IOException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.AccessControlList;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.GroupGrantee;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.Permission;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.lsware.joint_investigation.common.util.CustomResponseException;
import com.lsware.joint_investigation.common.util.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.lsware.joint_investigation.common.util.TextUtil;
import com.lsware.joint_investigation.common.s3.S3Buckets;
import com.lsware.joint_investigation.posts.entity.Post;

@Service
@Transactional("transactionManager")
public class FileService {
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    private final Path fileStorageLocation;

    @Value("${aws.s3.endpoint}")
    private String s3Endpoint;
    @Value("${aws.s3.path-style.enabled}")
    private Boolean pathStyleAccessEnabled;
    @Value("${aws.s3.region}")
    private String s3Region;
    @Value("${aws.credentials.access-key}")
    private String s3AccessKey;
    @Value("${aws.credentials.secret-key}")
    private String s3SecretKey;

    private final S3Buckets s3Buckets;

    // @Autowired
    // private FileRepository fileRepository;

    public FileService(@Value("${upload.path}") String path, S3Buckets s3Buckets) {
        this.s3Buckets = s3Buckets;
        // String path = "/home/upload";
        this.fileStorageLocation = Paths.get(path).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.",
                    ex);
        }
    }

    public String storeFile(MultipartFile file, String boardTypeStr) throws CustomResponseException {
        Post.BOARD_TYPE boardType;
        try {
            boardType = Post.BOARD_TYPE.valueOf(boardTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomResponseException("Invalid board type for file upload: " + boardTypeStr);
        }

        String bucketName;
        switch (boardType) {
            case Post.BOARD_TYPE.RESEARCH:
                bucketName = s3Buckets.getResearch();
                break;
            case Post.BOARD_TYPE.NOTICE:
                bucketName = s3Buckets.getNotice();
                break;
            default:
                throw new CustomResponseException("Unsupported board type: " + boardTypeStr);
        }

        String fileName = TextUtil.appendSuffix(
                file.getOriginalFilename().replaceAll("\\s+", "_"),
                "_" + System.currentTimeMillis());

        try {
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(s3Endpoint, s3Region))
                    .withPathStyleAccessEnabled(pathStyleAccessEnabled)
                    .withCredentials(
                            new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKey, s3SecretKey)))
                    .build();

            // Check and create bucket if it doesn't exist
            if (!s3Client.doesBucketExistV2(bucketName)) {
                try {
                    s3Client.createBucket(bucketName);
                } catch (AmazonS3Exception e) {
                    throw new CustomResponseException("Failed to create bucket: " + bucketName, e);
                }
            }

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getBytes().length);
            metadata.setContentEncoding("UTF-8");

            PutObjectRequest request = new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata);
            s3Client.putObject(request);

            URL downloadUrl = s3Client.getUrl(bucketName, fileName);
            return URLDecoder.decode(downloadUrl.toString(), StandardCharsets.UTF_8);

        } catch (AmazonS3Exception e) {
            throw new CustomResponseException("S3 error during file upload: " + e.getErrorMessage(), e);
        } catch (SdkClientException e) {
            throw new CustomResponseException("S3 client error (network or credentials issue).", e);
        } catch (IOException e) {
            throw new CustomResponseException("Error reading file for upload.", e);
        } catch (Exception e) {
            throw new CustomResponseException("Unexpected error uploading file to S3/MinIO.", e);
        }

    }

    public void deleteFile(String fileUrl) {
        try {
            // Extract bucket name and file name from URL
            String[] urlParts = fileUrl.split("/");
            String fileName = urlParts[urlParts.length - 1]; // Get last part after /
            String bucketName = urlParts[urlParts.length - 2]; // Get second to last part

            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(s3Endpoint, s3Region))
                    .withPathStyleAccessEnabled(pathStyleAccessEnabled)
                    .withCredentials(
                            new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKey, s3SecretKey)))
                    .build();

            s3Client.deleteObject(bucketName, fileName);
            logger.info("Successfully deleted file: {} from bucket: {}", fileName, bucketName);
        } catch (Exception e) {
            logger.error("Error deleting file from S3", e);
            throw new CustomResponseException("Error deleting file from S3", e);
        }
    }

    public String storeProfileImage(MultipartFile file) throws CustomResponseException {
        String fileUrl = "";
        String fileName = TextUtil.appendSuffix(file.getOriginalFilename().replaceAll("\\s+", "_"),
                "_" + new Date().getTime());
        try {
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(s3Endpoint, s3Region))
                    .withPathStyleAccessEnabled(pathStyleAccessEnabled)
                    .withCredentials(
                            new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKey, s3SecretKey)))
                    .build();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getBytes().length);
            metadata.addUserMetadata("name", "profile");
            metadata.setContentEncoding("UTF-8");

            PutObjectRequest request = new PutObjectRequest(s3Buckets.getProfileImages(), fileName,
                    file.getInputStream(), metadata);
            AccessControlList acl = new AccessControlList();
            acl.grantPermission(GroupGrantee.AllUsers, Permission.Read);
            request.setAccessControlList(acl);
            PutObjectResult s3result = s3Client.putObject(request);
            URL downloadUrl = s3Client.getUrl(s3Buckets.getProfileImages(), fileName);
            fileUrl = URLDecoder.decode(downloadUrl.toString(), StandardCharsets.UTF_8);

            if (s3result != null) {
                return fileUrl;
            } else {
                logger.error("===> failed s3result != null && downloadUrl != null : ");
            }
        } catch (AmazonServiceException e) {
            e.printStackTrace();
            logger.error("===> !AmazonServiceException ");
            throw new CustomResponseException("error uploading to aws s3", e);
        } catch (SdkClientException e) {
            e.printStackTrace();
            logger.error("===> !SdkClientException ");
            throw new CustomResponseException("error connecting to aws s3", e);
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("===> !IOException ");
            throw new CustomResponseException("error reading uploaded file", e);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("===> !Exception ");
            logger.error("Error occured during s3 upload", e);
            throw new CustomResponseException("Error occured during s3 upload", e);
        }
        return fileUrl;
    }

    public String storeInvestigationFile(MultipartFile file, String fileType) throws CustomResponseException {
        String fileName = TextUtil.appendSuffix(
                file.getOriginalFilename().replaceAll("\\s+", "_"),
                "_" + System.currentTimeMillis());

        try {
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(s3Endpoint, s3Region))
                    .withPathStyleAccessEnabled(pathStyleAccessEnabled)
                    .withCredentials(
                            new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKey, s3SecretKey)))
                    .build();

            String bucketName = s3Buckets.getInvestigation();

            // Check and create bucket if it doesn't exist
            if (!s3Client.doesBucketExistV2(bucketName)) {
                try {
                    s3Client.createBucket(bucketName);
                } catch (AmazonS3Exception e) {
                    throw new CustomResponseException("Failed to create investigation bucket: " + bucketName, e);
                }
            }

            // Create a folder structure based on file type (evidence or report)
            String folderPath = fileType.toLowerCase() + "/";
            String s3Key = folderPath + fileName;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getBytes().length);
            metadata.setContentEncoding("UTF-8");
            metadata.addUserMetadata("file-type", fileType);

            PutObjectRequest request = new PutObjectRequest(bucketName, s3Key, file.getInputStream(), metadata);
            AccessControlList acl = new AccessControlList();
            acl.grantPermission(GroupGrantee.AllUsers, Permission.Read);
            request.setAccessControlList(acl);
            s3Client.putObject(request);

            URL downloadUrl = s3Client.getUrl(bucketName, s3Key);
            return URLDecoder.decode(downloadUrl.toString(), StandardCharsets.UTF_8);

        } catch (AmazonS3Exception e) {
            throw new CustomResponseException("S3 error during investigation file upload: " + e.getErrorMessage(), e);
        } catch (SdkClientException e) {
            throw new CustomResponseException("S3 client error (network or credentials issue).", e);
        } catch (IOException e) {
            throw new CustomResponseException("Error reading investigation file for upload.", e);
        } catch (Exception e) {
            throw new CustomResponseException("Unexpected error uploading investigation file to S3/MinIO.", e);
        }
    }

}