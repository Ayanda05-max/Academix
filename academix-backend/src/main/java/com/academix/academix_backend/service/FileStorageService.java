package com.academix.academix_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.TreeSet;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private static final Map<String, String> ALLOWED = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("txt", "text/plain"),
            Map.entry("csv", "text/csv"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("gif", "image/gif"),
            Map.entry("zip", "application/zip")
    );

    private final Path root;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public record StoredFile(String storedName, String originalName, String contentType, long size) {}

    public StoredFile store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw bad("Please choose a file to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw bad("The file is too large. The limit is 10 MB");
        }

        String original = cleanName(file.getOriginalFilename());
        String extension = extensionOf(original);
        String contentType = ALLOWED.get(extension);
        if (contentType == null) {
            throw bad("This file type is not allowed. Allowed types: "
                    + String.join(", ", new TreeSet<>(ALLOWED.keySet())));
        }

        Path directory = root.resolve(folder).normalize();
        if (!directory.startsWith(root)) {
            throw bad("Invalid upload folder");
        }

        String storedName = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(directory);
            Path target = directory.resolve(storedName).normalize();
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save the file");
        }
        return new StoredFile(storedName, original, contentType, file.getSize());
    }

    public Resource load(String folder, String storedName) {
        Path path = root.resolve(folder).resolve(storedName).normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file could not be found");
        }
        return new FileSystemResource(path);
    }

    public void delete(String folder, String storedName) {
        Path path = root.resolve(folder).resolve(storedName).normalize();
        if (!path.startsWith(root)) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Could not delete file " + path + ": " + e.getMessage());
        }
    }

    private String cleanName(String name) {
        if (name == null) {
            return "file";
        }
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        String cleaned = (slash >= 0 ? name.substring(slash + 1) : name)
                .replaceAll("[\\p{Cntrl}]", "")
                .trim();
        if (cleaned.isEmpty()) {
            return "file";
        }
        return cleaned.length() > 150 ? cleaned.substring(cleaned.length() - 150) : cleaned;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "";
        }
        return name.substring(dot + 1).toLowerCase();
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}