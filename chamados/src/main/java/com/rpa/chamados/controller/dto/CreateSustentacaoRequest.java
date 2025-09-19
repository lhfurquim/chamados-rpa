package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSustentacaoRequest(

        @NotBlank
        String description,

        @NotBlank
        String submittedBy,
        User user,

        @NotBlank
        String idCliente,

        @NotBlank
        String nomeCliente,

        @NotBlank
        String idServico,

        @NotBlank
        String nomeServico,

        @NotBlank
        String empresa,

        @NotNull
        Boolean temDocumentacao,

        @NotBlank
        String tecnologiaAutomacao,

        @NotBlank
        String usuarioAutomacao,

        @NotBlank
        String servidorAutomacao,

        @NotBlank
        String celula,

        @NotBlank
        String robotSelecionado

) {
}
