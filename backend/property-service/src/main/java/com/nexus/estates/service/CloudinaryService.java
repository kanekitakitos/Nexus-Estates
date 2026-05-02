package com.nexus.estates.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nexus.estates.service.repository.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
    private final String uploadPreset;
    private final boolean fetchEnabled;
    private final String fetchTransform;

    public CloudinaryService(
            String cloudName,
            String apiKey,
            String apiSecret,
            String folderPath
    ) {
        this.folderPath = folderPath;
        this.uploadPreset = "";
        this.fetchEnabled = true;
        this.fetchTransform = "f_auto,q_auto,c_limit,w_1200";
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    @Autowired
    public CloudinaryService(
            @Value("${cloudinary.url:}") String cloudinaryUrl,
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.folder:nexus_estates/properties}") String folderPath,
            @Value("${cloudinary.upload-preset:}") String uploadPreset,
            @Value("${cloudinary.fetch.enabled:true}") boolean fetchEnabled,
            @Value("${cloudinary.fetch.transform:f_auto,q_auto,c_limit,w_1200}") String fetchTransform) {
        this.folderPath = folderPath;
        this.uploadPreset = uploadPreset;
        this.fetchEnabled = fetchEnabled;
        this.fetchTransform = fetchTransform;

        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true));
        }
    }

    /**
     * Gera os parâmetros de autenticação para upload direto (Presigned).
     * @return Mapa com os dados de autenticação e expiração
     */
    @Override
    public Map<String, Object> getUploadParameters() {
        if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()
                || cloudinary.config.apiKey == null || cloudinary.config.apiKey.isBlank()
                || cloudinary.config.apiSecret == null || cloudinary.config.apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary não configurado: define CLOUDINARY_URL ou CLOUDINARY_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.");
        }

        long timestamp = System.currentTimeMillis() / 1000L;
        int expirationMinutes = 15; // Critério de aceitação

        Map<String, Object> params = new TreeMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folderPath);
        if (uploadPreset != null && !uploadPreset.isBlank()) {
            params.put("upload_preset", uploadPreset);
        }

        // Gera a assinatura digital
        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        params.put("signature", signature);
        params.put("api_key", cloudinary.config.apiKey);
        params.put("cloud_name", cloudinary.config.cloudName);
        if (uploadPreset != null && !uploadPreset.isBlank()) {
            params.put("upload_preset", uploadPreset);
        }

        // Adiciona o tempo de expiração para o frontend saber até quando o URL é válido
        params.put("expires_at", timestamp + (expirationMinutes * 60));

        // Endpoint explícito de upload para o Frontend (processo completo client-side)
        String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudinary.config.cloudName + "/image/upload";
        params.put("upload_url", uploadUrl);

        return params;
    }

    @Override
    public String resolveDeliveryUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return imageUrl;
        if (!fetchEnabled) return imageUrl;
        if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()) return imageUrl;
        if (imageUrl.contains("res.cloudinary.com/")) return imageUrl;
        if (!imageUrl.contains("images.unsplash.com/")) return imageUrl;

        String encoded = URLEncoder.encode(imageUrl, StandardCharsets.UTF_8).replace("+", "%20");
        return "https://res.cloudinary.com/" + cloudinary.config.cloudName + "/image/fetch/" + fetchTransform + "/" + encoded;
    }
}
