package com.nexus.estates.service;

import java.util.Map;

/**
 * Interface genérica para serviços de armazenamento de imagens.
 *
 * <p>Define o contrato para operações de upload e gestão de imagens, permitindo
 * a troca transparente de provedores (ex: Cloudinary, AWS S3) sem afetar
 * os consumidores do serviço.</p>
 *
 * @author Nexus Estates Team
 */
public interface ImageStorageService {

    /**
     * Gera os parâmetros necessários para realizar o upload de uma imagem.
     *
     * @return Mapa com as credenciais e configurações de upload (ex: assinatura, timestamp, url)
     */
    Map<String, Object> getUploadParameters();
}