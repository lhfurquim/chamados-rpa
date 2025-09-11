package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateRequest(

        @NotNull(message = "Tipo de serviço é obrigatório")
        ServiceType serviceType,

        @NotBlank(message = "Descrição é obrigatória e não pode estar vazia")
        String description,

        // submittedBy is automatically populated from JWT token authentication
        String roi,
        String celula,
        String cliente,
        String servico,
        String areaNegocio,
        String nomeProcesso,
        String descricaoProcesso,
        String regrasDefinidas,
        String processoRepetitivo,
        String dadosEstruturados,
        String ocorrenciaSustentacao,
        String celulaCode,
        String celulaOutra,
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
        
        // New fields for Novo Projeto
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
        String restricaoTecnologiaSistema
        
        // Note: Submitter information is automatically extracted from JWT token authentication

) {
}
