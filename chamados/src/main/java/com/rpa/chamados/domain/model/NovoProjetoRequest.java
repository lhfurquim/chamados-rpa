package com.rpa.chamados.domain.model;

import com.rpa.chamados.domain.model.enums.ServiceType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("NOVO_PROJETO")
public class NovoProjetoRequest extends Request {

    @Column(columnDefinition = "TEXT")
    private String roi;

    private String cliente;
    private String servico;
    private String areaNegocio;
    private String nomeProcesso;

    private String frequenciaExecucao;
    private String sazonalidade;

    @Column(columnDefinition = "TEXT")
    private String volumetria;

    private String duracaoCadaCaso;
    private Integer quantasPessoasTrabalham;
    private String fonteDadosEntrada;

    @Column(columnDefinition = "TEXT")
    private String usaMFA;

    @Column(columnDefinition = "TEXT")
    private String existeCaptcha;

    @Column(columnDefinition = "TEXT")
    private String existeCertificadoDigital;

    @Column(columnDefinition = "TEXT")
    private String possivelUsarAPI;

    @Column(columnDefinition = "TEXT")
    private String possibilidadeUsuarioRobotico;

    @Column(columnDefinition = "TEXT")
    private String limitacaoAcessoLogin;

    @Column(columnDefinition = "TEXT")
    private String acessoAplicacoes;

    @Column(columnDefinition = "TEXT")
    private String rdpOpcaoPositiva;

    @Column(columnDefinition = "TEXT")
    private String necessitaVPN;

    @Column(columnDefinition = "TEXT")
    private String analiseHumanaEtapa;

    @Column(columnDefinition = "TEXT")
    private String restricaoTecnologiaSistema;

    private String regrasDefinidas;
    private String processoRepetitivo;
    private String dadosEstruturados;

    @Override
    public ServiceType getServiceType() {
        return ServiceType.NOVO_PROJETO;
    }
}
