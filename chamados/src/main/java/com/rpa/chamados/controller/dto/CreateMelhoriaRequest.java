package com.rpa.chamados.controller.dto;

import com.rpa.chamados.domain.model.SubmitterInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMelhoriaRequest(

        @NotBlank
        String description,

        @NotBlank
        String submittedBy,

        @NotBlank
        String celula,

        @NotBlank
        String robot,

        @NotNull
        SubmitterInfo submitterInfo,

        @NotNull
        Boolean jaSustentada,

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
        String servidorAutomacao

) {
}
