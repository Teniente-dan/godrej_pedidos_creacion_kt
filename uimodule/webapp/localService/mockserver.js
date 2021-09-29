sap.ui.define(
  [
    "sap/ui/core/util/MockServer",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/base/util/UriParameters",
    "sap/ui/model/type/Currency",
  ],
  function (MockServer,
    JSONModel,
    Log,
    UriParameters,
    Currency) {
    "use strict";

    var oMockServer,
      _sAppPath = "godrej/pedidoscrea/",
      _sJsonFilesPath = _sAppPath + "localService/mockdata";

    var oMockServerInterface = {
      /**
       * Initializes the mock server asynchronously.
       * You can configure the delay with the URL parameter "serverDelay".
       * The local mock data in this folder is returned instead of the real data for testing.
       * @protected
       * @param {object} [oOptionsParameter] init parameters for the mockserver
       * @returns{Promise} a promise that is resolved when the mock server has been started
       */
      init: function (oOptionsParameter) {
        var oOptions = oOptionsParameter || {};

        return new Promise(function (fnResolve, fnReject) {
          var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
            oManifestModel = new JSONModel(sManifestUrl);

          oManifestModel.attachRequestCompleted(function () {
            var oUriParameters = new UriParameters(window.location.href),
              // parse manifest for local metadata URI
              sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath),
              oMainDataSource = oManifestModel.getProperty(
                "/sap.app/dataSources/mainService"
              ),
              sMetadataUrl = sap.ui.require.toUrl(
                _sAppPath + oMainDataSource.settings.localUri
              ),
              // ensure there is a trailing slash
              sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ?
              oMainDataSource.uri :
              oMainDataSource.uri + "/";
            // ensure the URL to be relative to the application
            // sMockServerUrl = sMockServerUrl && new URI(sMockServerUrl).absoluteTo(sap.ui.require.toUrl(_sAppPath)).toString();

            // create a mock server instance or stop the existing one to reinitialize
            if (!oMockServer) {
              oMockServer = new MockServer({
                rootUri: sMockServerUrl,
              });
            } else {
              oMockServer.stop();
            }

            // configure mock server with the given options or a default delay of 0.5s
            MockServer.config({
              autoRespond: true,
              autoRespondAfter: oOptions.delay || oUriParameters.get("serverDelay") || 2,
            });

            // simulate all requests using mock data
            oMockServer.simulate(sMetadataUrl, {
              sMockdataBaseUrl: sJsonFilesUrl,
              bGenerateMissingMockData: true,
            });

            var aRequests = oMockServer.getRequests();

            // compose an error response for each request
            var fnResponse = function (iErrCode, sMessage, aRequest) {
              aRequest.response = function (oXhr) {
                oXhr.respond(
                  iErrCode, {
                    "Content-Type": "text/plain;charset=utf-8"
                  },
                  sMessage
                );
              };
            };

            // simulate metadata errors
            if (oOptions.metadataError || oUriParameters.get("metadataError")) {
              aRequests.forEach(function (aEntry) {
                if (aEntry.path.toString().indexOf("$metadata") > -1) {
                  fnResponse(500, "metadata Error", aEntry);
                }
              });
            }

            // simulate request errors
            var sErrorParam =
              oOptions.errorType || oUriParameters.get("errorType"),
              iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
            if (sErrorParam) {
              aRequests.forEach(function (aEntry) {
                fnResponse(iErrorCode, sErrorParam, aEntry);
              });
            }

            // custom mock behaviour may be added here

            // set requests and start the server
            oMockServer.setRequests(aRequests);
            oMockServer.start();

            Log.info("Running the app with mock data");
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.GET,
              function (oCall) {
                // oCall.mParameters.oFilteredData.name = "xxx";
                // oCall.mParameters.oFilteredData.ext = "xls";
                console.log("Clase de Pedido");
              },
              "ClasePedidoSet"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.GET,
              function (oCall) {
                console.log("Clientes");
              },
              "ClienteSet"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.GET,
              function (oCall) {
                console.log("Material request");
              },
              "MaterialSet"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.POST,
              function (oCall) {
                oCall.mParameters.oEntity.Bstkd = "S: a wevo!";
                // oCall.mParameters.oEntity.Bstkd = "E: nel!";
                console.log("PedidoCab request");
              },
              "PedidoCabSet"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.POST,
              function (oCall) {
                switch (
                  oCall.mParameters.oXhr.requestBody.includes("40016294")
                ) {
                  case true:
                    var payload = {
                      results: [{
                        Matnr: "40016294",
                        Precio: "333.50",
                        Cliente: "",
                        Clase: "",
                        Organizacion: "",
                        Canal: "",
                        Bruto: "301.50",
                        Neto: "310",
                        Promo: "123",
                        Cond1: "213",
                        Cond2: "",
                        Cond3: "999",
                        Promo: "   1648.0200-",
                        Currency: "asd"
                      }, ],
                    };
                    break;
                  default:
                    var payload = {
                      results: [{
                        Matnr: "63003320",
                        Precio: "444",
                        Cliente: "",
                        Clase: "",
                        Organizacion: "",
                        Canal: "",
                        Bruto: "356.50",
                        Neto: "365",
                        Promo: "56",
                        Cond1: "90",
                        Cond2: "777",
                        Cond3: "",
                      }, ],
                    };
                }
                oCall.mParameters.oEntity.to_precios = payload;
                console.log("Precio request");
              },
              "PrecioSet"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.POST,
              function (oCall) {
                switch (oCall.mParameters.oEntity.EmployeeID) {
                  case 1:
                    var sections = [{
                        SeccionID: 1,
                        Largo: "INEEEEE",
                        SecPorcentaje: 25,
                        // "MaxFile": 4,
                        // "CurrFile": 2,
                        Seccion_Details: [{
                            SeccionID: 1,
                            Documento: 123,
                            Estatus: "Activo",
                            ModDate: "2021-10-30",
                            Nombre: "INE frente",
                          },
                          {
                            SeccionID: 1,
                            Documento: 124,
                            Estatus: "Activo",
                            ModDate: "2021-10-30",
                            Nombre: "INE reverso",
                          },
                          {
                            SeccionID: 1,
                            Documento: 125,
                            Estatus: "Activo",
                            ModDate: "2021-10-30",
                            Nombre: "INE reversox",
                          },
                          {
                            SeccionID: 1,
                            Documento: 126,
                            Estatus: "Activo",
                            ModDate: "2021-10-30",
                            Nombre: "INE reversoxxxx",
                          },
                          {
                            SeccionID: 1,
                            Documento: 127,
                            Estatus: "Activo",
                            ModDate: "2021-10-30",
                            Nombre: "INE reversoxyyy",
                          },
                        ],
                      },
                      {
                        SeccionID: 2,
                        SecPorcentaje: 50,
                        // "MaxFile": 2,
                        // "CurrFile": 2,
                        Largo: "RFCCCCC",
                        Seccion_Details: [{
                          SeccionID: 1,
                          Documento: 333,
                          Estatus: "Activo",
                          ModDate: "2021-10-30",
                          Nombre: "INE frente",
                        }, ],
                      },
                      {
                        SeccionID: 3,
                        SecPorcentaje: 75,
                        // "MaxFile": 3,
                        // "CurrFile": 1,
                        Largo: "RFCCCCCXX",
                      },
                      {
                        SeccionID: 4,
                        SecPorcentaje: 100,
                        // "MaxFile": 3,
                        // "CurrFile": 1,
                        Largo: "RFCCCCCXXyy",
                      },
                    ];
                    break;
                  case 3:
                    // sections = [{
                    //     "SeccionID": 3,
                    //     "SecPorcentaje" : 100,
                    //     "Largo": "ActaAAA"
                    // }, {
                    //     "SeccionID": 4,
                    //     "SecPorcentaje" : 0,
                    //     "Largo": "Licencia"
                    // }];
                    break;

                  default:
                }
                oCall.mParameters.oEntity.EmployeeToSeccion = sections;
                console.log("Sections");
              },
              "EmployeeSeccions"
            );
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.GET,
              function (oCall) {
                console.log("mockcall3");
              },
              "FechaPreferenteEntregaSet"
            );

            fnResolve();
          });

          oManifestModel.attachRequestFailed(function () {
            var sError = "Failed to load application manifest";

            Log.error(sError);
            fnReject(new Error(sError));
          });
        });
      },

      /**
       * @public returns the mockserver of the app, should be used in integration tests
       * @returns {sap.ui.core.util.MockServer} the mockserver instance
       */
      getMockServer: function () {
        return oMockServer;
      },
    };

    return oMockServerInterface;
  }
);