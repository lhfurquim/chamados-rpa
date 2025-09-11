package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.ServiceType;

import java.time.LocalDateTime;
import java.util.List;

public record RequestDto(
        String id,
        ServiceType serviceType,
        String description,
        String submittedBy,
        SubmitterInfoDto submitterInfo,
        String roi,
        String celula,
        String areaNegocio,
        String nomeProcesso,
        String regrasDefinidas,
        String processoRepetitivo,
        String dadosEstruturados,
        String robotSelecionado,
        Boolean jaSustentada,
        String idCliente,
        String nomeCliente,
        String idServico,
        String nomeServico,
        String empresa,
        Boolean temDocumentacao,
        String tecnologiaAutomacao,
        String usuarioAutomacao,
        String servidorAutomacao,
        List<String> documentacaoFiles,
        List<String> evidenciasFiles,
        String frequenciaExecucao,
        String sazonalidade,
        String volumetria,
        String duracaoCadaCaso,
        Integer quantasPessoasTrabalham,
        String fonteDadosEntrada,
        String usaMFA,
        String existeCaptcha,
        String existeCertificadoDigital,
        String possivelUsarAPI,
        String possibilidadeUsuarioRobotico,
        String limitacaoAcessoLogin,
        String acessoAplicacoes,
        String rdpOpcaoPositiva,
        String necessitaVPN,
        String analiseHumanaEtapa,
        String restricaoTecnologiaSistema,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
