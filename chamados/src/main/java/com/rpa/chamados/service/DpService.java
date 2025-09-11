package com.rpa.chamados.service;

import java.util.List;
import java.util.Map;

public interface DpService {

    List<Map<String, Object>> findAllCells();
    List<Map<String, Object>> findClientIdByCell(Integer cellId);
    List<Map<String, Object>> findServiceIdByCellAndClient(Integer cellId, Integer clientId);

}
