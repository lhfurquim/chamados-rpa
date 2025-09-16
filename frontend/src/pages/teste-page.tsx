import { createCard } from "../services/plannerService";

export default function TestePage() {

  const testar = async() => {
    await createCard({
        "requestId": "j1ioj1oij-eeqw-iej",
        "serviceType": "MELHORIA",
        "description": "Teste melhoria",
        "submittedBy": "lhfurquim@latam.stefanini.com",
        "roi": "ROI",
        "celula": "1146",
        "cliente": "195",
        "servico": "serviço",
        "areaNegocio": "",
        "nomeProcesso": "",
        "regrasDefinidas": "",
        "processoRepetitivo": "",
        "dadosEstruturados": "",
        "ocorrenciaSustentacao": "",
        "roboSelecionado": "Valor_Desconto_Wellhub",
        "jaSustentada": false,
        "idCliente": "",
        "nomeCliente": "",
        "idServico": "",
        "nomeServico": "",
        "empresa": "",
        "temDocumentacao": false,
        "tecnologiaAutomacao": "",
        "usuarioAutomacao": "",
        "servidorAutomacao": "",
        "documentacaoFiles": [],
        "evidenciasFiles": [],
        "frequenciaExecucao": "",
        "sazonalidade": "",
        "volumetria": "",
        "duracaoCadaCaso": "",
        "quantasPessoasTrabalham": 0,
        "fonteDadosEntrada": "",
        "usaMFA": "",
        "existeCaptcha": "",
        "existeCertificadoDigital": "",
        "possivelUsarAPI": "",
        "possibilidadeUsuarioRobotico": "",
        "limitacaoAcessoLogin": "",
        "acessoAplicacoes": "",
        "rdpOpcaoPositiva": "",
        "necessitaVPN": "",
        "analiseHumanaEtapa": "",
        "restricaoTecnologiaSistema": ""
    });
  }
  
  return (
    <button onClick={testar}>
      Testar
    </button>
  );

}