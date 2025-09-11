package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateRequest(

        ServiceType serviceType,

        @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
        String description,

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
        String restricaoTecnologiaSistema,
        
        String issueType

) {
}