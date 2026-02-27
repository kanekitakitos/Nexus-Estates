package com.nexus.estates.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.TreeMap;

/**
 * Serviço responsável pela integração com o Cloudinary.
 * <p>Gera assinaturas de segurança para permitir que o frontend faça upload
 * de imagens diretamente para a nuvem.</p>
 */
@Service
public class CloudinaryService implements ImageStorageService {

    private final Cloudinary cloudinary;
    private final String folderPath;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.folder:nexus_estates/properties}") String folderPath) {
        this.folderPath = folderPath;

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    /**
     * Gera os parâmetros de autenticação para upload direto (Presigned).
     * @return Mapa com os dados de autenticação e expiração
     */
    @Override
    public Map<String, Object> getUploadParameters() {
        long timestamp = System.currentTimeMillis() / 1000L;
        int expirationMinutes = 15; // Critério de aceitação

        Map<String, Object> params = new TreeMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folderPath);

        // Gera a assinatura digital
        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        params.put("signature", signature);
        params.put("api_key", cloudinary.config.apiKey);
        params.put("cloud_name", cloudinary.config.cloudName);

        // Adiciona o tempo de expiração para o frontend saber até quando o URL é válido
        params.put("expires_at", timestamp + (expirationMinutes * 60));

        // Endpoint explícito de upload para o Frontend (processo completo client-side)
        String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudinary.config.cloudName + "/auto/upload";
        params.put("upload_url", uploadUrl);

        return params;
    }
}
