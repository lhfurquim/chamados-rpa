package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@DiscriminatorValue("SUSTENTACAO")
public class SustentacaoRequest extends Request{

    public SustentacaoRequest() {
        this.documentacaoFiles = new ArrayList<>();
        this.evidenciasFiles = new ArrayList<>();
    }

    private String idCliente;
    private String nomeCliente;
    private String idServico;
    private String nomeServico;
    private Boolean temDocumentacao;
    private String usuarioAutomacao;
    private String servidorAutomacao;

    @ElementCollection
    @CollectionTable(name = "request_evidencias_files", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "file_name")
    private List<String> evidenciasFiles;


    @ElementCollection
    @CollectionTable(name = "request_documentacao_files", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "file_name")
    private List<String> documentacaoFiles;


    @Override
    public ServiceType getServiceType() {
        return ServiceType.SUSTENTACAO;
    }

    public void addDoc(String docUrl) {
        this.documentacaoFiles.add(docUrl);
    }

    public void addEvidencia(String evUrl) {
        this.evidenciasFiles.add(evUrl);
    }

}
