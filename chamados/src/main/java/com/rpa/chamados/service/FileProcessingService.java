package com.rpa.chamados.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileProcessingService {
    
    List<String> extractFileNames(List<MultipartFile> files);
    
    void validateFiles(List<MultipartFile> files, String fileType);
}