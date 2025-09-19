package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNovoProjetoRequest(

        @NotBlank
        String description,

        @NotBlank
        String submittedBy,

        @NotNull
        User user,

        @NotBlank
        String roi,

        @NotBlank
        String celula,

        @NotBlank
        String cliente,

        @NotBlank
        String servico,

        @NotBlank
        String areaNegocio,

        @NotBlank
        String nomeProcesso,

        @NotBlank
        String frequenciaExecucao,

        @NotBlank
        String sazonalidade,

        @NotBlank
        String volumetria,

        @NotBlank
        String duracaoCadaCaso,

        @NotNull
        Integer quantasPessoasTrabalham,

        @NotBlank
        String fonteDadosEntrada,

        @NotBlank
        String usaMFA,

        @NotBlank
        String existeCaptcha,

        @NotBlank
        String existeCertificadoDigital,

        @NotBlank
        String possivelUsarAPI,

        @NotBlank
        String possibilidadeUsuarioRobotico,

        @NotBlank
        String limitacaoAcessoLogin,

        @NotBlank
        String acessoAplicacoes,

        @NotBlank
        String rdpOpcaoPositiva,

        @NotBlank
        String necessitaVPN,

        @NotBlank
        String analiseHumanaEtapa,

        @NotBlank
        String restricaoTecnologiaSistema,

        @NotBlank
        String regrasDefinidas,

        @NotBlank
        String processoRepetitivo,

        @NotBlank
        String dadosEstruturados

){
}
