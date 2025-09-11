package com.rpa.chamados.repository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class DpRepository {

    private final JdbcTemplate jdbcTemplate;

    public DpRepository(@Qualifier("dpJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> listarCelulas() {
        String sql = "SELECT distinct ID_CELULA\n" +
                "FROM DW.SCH_HR.TBL_NATCORP_DIM_PROFISSIONAIS\n" +
                "where inativo=0 and\n" +
                "ID_CELULA <> 0 and ID_CLIENTE <> 0 and ID_SERVICO <> 0\n" +
                "order by id_celula";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> listarClientePorCelula(Integer idCelula) {
        String sql = "SELECT distinct ID_CELULA, ID_CLIENTE FROM DW.SCH_HR.TBL_NATCORP_DIM_PROFISSIONAIS where inativo=0 and ID_CELULA <> 0 and ID_CLIENTE <> 0 and ID_SERVICO <> 0 and ID_CELULA=%d order by id_celula".formatted(idCelula);

        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> listarServicoPorCelulaECliente(Integer idCelula, Integer idCliente) {
        String sql = "SELECT distinct ID_CELULA,ID_CLIENTE,ID_SERVICO FROM DW.SCH_HR.TBL_NATCORP_DIM_PROFISSIONAIS where inativo=0 and ID_CELULA <> 0 and ID_CLIENTE <> 0 and ID_SERVICO <> 0 and ID_CELULA=%d and ID_CLIENTE=%d order by id_celula".formatted(idCelula, idCliente);

        return jdbcTemplate.queryForList(sql);
    }


}
