/* eslint-disable no-console */
/* global XLSX:true */
sap.ui.define(
  [
    "godrej/pedidoscrea/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Text",
    "godrej/pedidoscrea/libs/xlsx.full.min"
  ],
  function (BaseController, JSONModel, Fragment, MessageToast, Filter, FilterOperator, MessageBox, Dialog,
    DialogType,
    Button,
    ButtonType,
    Text, xlsx) {
    "use strict";

    return BaseController.extend("godrej.pedidoscrea.controller.MainView", {
      onInit: function () {
        this._oTable = this.getView().byId("Postable");
        this.mainModel = this.getView().getModel();
        this.formatter = new Intl.NumberFormat("de-us");

        // Inicializa modelos-------------------------------------------
        // ****************************************************************
        // ****************************************************************

        // Pedido
        // ****************************************************************
        this.initPedido();
        // Tabla posiciones
        this.initMatTableModel();

        // combobox tipo de pedidos
        // ****************************************************************
        this.byId("tipopedidoMulti").setBusy(true);
        this.getOdataAsModel("ClasePedidoSet")
          .then((oModel) => {
            return new Promise((resolve, reject) => {
              this.getView().setModel(oModel, "clasePedidos");
              resolve(oModel);
            });
          })
          .then((loadedModel) => {
            //set default
            var getDefault = loadedModel.getData().reduce((claseDefault, clase) => {
              if (clase.Default === "X") {
                claseDefault = clase.ClaseP;
              }
              return claseDefault;
            }, 0);
            getDefault = getDefault === 0 ? "" : getDefault;
            this.getView().byId("tipopedidoMulti").setValue(getDefault);
            this.actualizaDatosPedido("/clasePedido", getDefault);
            this.byId("tipopedidoMulti").setBusy(false);
          })
          .catch((error) => {
            this.byId("tipopedidoMulti").setBusy(false);
            this.byId("tipopedidoMulti").setEnabled(false);
          });

        // clientes
        // ****************************************************************
        this.getOdataAsModel("ClienteSet")
          .then((oModel) => {
            this.setModel(oModel, "clienteAll");
            this.actualizaDatosPedido("/clienteBusy", false);
            console.log("cliente Loaded");
          })
          .catch((error) => {
            this.actualizaDatosPedido("/clienteBusy", false);
            this.actualizaDatosPedido("/clienteEnabled", false);
            console.log("cliente NOT Loaded");
          });
        this.byId("client").setSuggestionRowValidator(
          this.suggestionRowValidator
        );
      },
      initMatTableModel: function () {
        this.byId("Postable").destroyAggregation("items");
        var oTabMat = this.addRowJson(1);
        var oModelTabMat = new JSONModel(oTabMat);
        this.getView().setModel(oModelTabMat, "materiales");
      },
      // Linea inicial y agregar nueva linea
      // ****************************************************************
      addRowJson: function (rows, inModel) {
        var out = !inModel ? [] : inModel;
        for (let index = 0; index < rows; index++) {
          out.push(this.newLine());
        }
        return out;
      },
      agregarMaterial: function () {
        //agrego una linea vacía para poder cargar un material
        var materiales = this.getView().getModel("materiales").getProperty("/");
        var material = this.newLine();
        materiales.push(material);
        this.getView().getModel("materiales").setProperty("/", materiales);
      },
      newLine: function () {
        return {
          Cantidad: 0,
          Precio: 0,
          Unidad: this.getResourceBundle().getText("currPlaceHolder"),
        };
      },

      // Actualizar titulos posiciones
      // ****************************************************************
      updateTitle: function (iTotalItems) {
        var sTitle;
        // only update the counter if the length is final
        if (this._oTable.getBinding("items").isLengthFinal()) {
          sTitle = this.getResourceBundle().getText("listTitle", [iTotalItems]);
          this.actualizaDatosPedido("/totalPosiciones", sTitle);
        }
      },

      //Pedido
      // ****************************************************************
      // ****************************************************************
      actualizaDatosPedido: function (prop, data) {
        this.getModel("pedido").setProperty(prop, data);
      },
      initPedido: function (afterPedido, cancelar) {
        if (afterPedido) {
          console.log("afterPedido");
          //evita que los materiales se actualicen con datos 
          this.afterPedido = true;
          this.getView().getModel("clienteLocal").setProperty("/", {});
          // var currData = this.getView().getModel("pedido").getData();
          var oModelPedido = new JSONModel({
            totalItems: 0,
            totalCant: 0,
            cantUnit: this.getResourceBundle().getText("currPlaceHolder"),
            totalUnidad: 0,
            unidadUnit: "UN",
            totalPosiciones: "",
            fechaPreferente: "",
            ordenCompra: "",

            cliente: "",
            condPago: "",
            clasePedido: "",
            clienteBusy: false,
            clienteEnabled: true,
            condBusy: false,
            condEnabled: false,
            fechaEnabled: false,

            matBlocked: true,
            matBusy: false,
            //Datos desde Set Cliente
            Kunnr: "",
            OrganizacionVenta: "",
            CanalDistribucion: "",
            ClienteRol: "",

            subCanal: "", //Sector
            vendedor: "",
            oficinaDeVentas: "",
            destinatarioFactura: "",
          });
        } else if (cancelar) {
          var oModelPedido = new JSONModel({
            totalItems: 0,
            totalCant: 0,
            cantUnit: this.getResourceBundle().getText("currPlaceHolder"),
            totalUnidad: 0,
            unidadUnit: "UN",
            totalPosiciones: "",
            fechaPreferente: "",
            ordenCompra: "",
            cliente: "",
            condPago: "",
            clasePedido: "",
            clienteBusy: false,
            clienteEnabled: true,
            matBlocked: true,
            matBusy: false,
            condBusy: false,
            condEnabled: false,
            fechaEnabled: false,
            //Datos desde Set Cliente
            Kunnr: "",
            OrganizacionVenta: "",
            CanalDistribucion: "",
            ClienteRol: "",

            subCanal: "", //Sector
            vendedor: "",
            oficinaDeVentas: "",
            destinatarioFactura: "",
            // numeroDeDias: "",
          });
        } else {
          var oModelPedido = new JSONModel({
            totalItems: 0,
            totalCant: 0,
            cantUnit: this.getResourceBundle().getText("currPlaceHolder"),
            totalUnidad: 0,
            unidadUnit: "UN",
            totalPosiciones: "",
            fechaPreferente: "",
            noDate: false,
            ordenCompra: "",
            cliente: "",
            condPago: "",
            clasePedido: "",
            clienteBusy: true,
            clienteEnabled: false,
            condBusy: false,
            condEnabled: false,
            fechaEnabled: false,

            matBlocked: true,
            matBusy: false,
            //Datos desde Set Cliente
            Kunnr: "",
            OrganizacionVenta: "",
            CanalDistribucion: "",
            ClienteRol: "",

            subCanal: "", //Sector
            vendedor: "",
            oficinaDeVentas: "",
            destinatarioFactura: "",
            // numeroDeDias: "",
          });
        }
        this.getView().setModel(oModelPedido, "pedido");
        this.getModel("pedido").refresh();
      },

      //Clientes
      // ****************************************************************
      // ****************************************************************
      onHandleClientSuggest: function (oEvent) {
        var aFilters = [];
        var sTerm = oEvent.getParameter("suggestValue");
        if (sTerm) {
          aFilters.push(new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sTerm));
          aFilters.push(new sap.ui.model.Filter("Nombre", sap.ui.model.FilterOperator.Contains, sTerm));
          aFilters.push(new sap.ui.model.Filter("Direccion", sap.ui.model.FilterOperator.Contains, sTerm));
        }
        var orFilter = new Filter({
          filters: aFilters,
          and: false
        });
        oEvent.getSource().getBinding("suggestionRows").filter(new Filter({
          filters: [orFilter,
            new sap.ui.model.Filter("OrganizacionVenta", sap.ui.model.FilterOperator.EQ, this.getModel("pedido").getData().OrganizacionVenta)
          ],
          and: true
        }));
        //do not filter the provided suggestions before showing them to the user - important
        oEvent.getSource().setFilterSuggests(false);
      },
      suggestionRowValidator: function (oColumnListItem) {
        var aCells = oColumnListItem.getCells();
        return new sap.ui.core.Item({
          key: aCells[0].getText(),
          text: aCells[1].getText(),
        });
      },
      suggestionItemSelected: function (oEvent) {
        console.log("Event Handler: suggestionItemSelected");
        var oClienteData = this.getModel("clienteAll").getProperty(
          oEvent.getParameter("selectedRow").getBindingContextPath("clienteAll")
        );
        var oModel = new JSONModel(oClienteData);
        this.getView().setModel(oModel, "clienteLocal");
        this.actualizaDatosPedido("/Kunnr", oClienteData.Kunnr);
        this.actualizaDatosPedido("/OrganizacionVenta", oClienteData.OrganizacionVenta);
        this.actualizaDatosPedido("/CanalDistribucion", oClienteData.CanalDistribucion);
        this.actualizaDatosPedido("/ClienteRol", oClienteData.ClienteRol);

        this.actualizaDatosPedido("/subCanal", oClienteData.SubCanal);
        this.actualizaDatosPedido("/vendedor", oClienteData.Vendedor);
        this.actualizaDatosPedido("/oficinaDeVentas", oClienteData.OficinaVentas);
        this.actualizaDatosPedido("/destinatarioFactura", oClienteData.DestinatarioFactura);
        this.getCondPago(oClienteData);

        if (oClienteData.OrganizacionVenta) {
          this.actualizaDatosPedido("/matBlocked", false);
          this.getMatData();
        }
        this.getFechaPreferente(undefined).then((res) => (console.log("client selected, new date:" + res)));
      },

      getCondPago: function (oClienteData) {
        this.actualizaDatosPedido("/condBusy", true);
        var pedido = this.getModel("pedido").getData();
        var oFilter = [
          new Filter("OrganizacionVenta", sap.ui.model.FilterOperator.EQ, pedido.OrganizacionVenta),
          new Filter("Kunnr", sap.ui.model.FilterOperator.EQ, pedido.cliente),
          new Filter("Canal", sap.ui.model.FilterOperator.EQ, pedido.CanalDistribucion),
          new Filter("CondicionP", sap.ui.model.FilterOperator.EQ, "X")
        ];
        this.getOdataAsModel("CondicionPagoSet", oFilter).then(res => {
          this.setModel(res, "CondicionPago");
          console.log("Condicion de Pago Loaded");
        }).then(() => {
          var condicionToSet = this.getModel("CondicionPago").getData().find(x => x.CondicionP === oClienteData.CondicionPago);
          if (condicionToSet) {
            this.byId("CondPago").setSelectedKey(condicionToSet.CondicionP);
            this.actualizaDatosPedido("/condPago", oClienteData.CondicionPago);
            this.actualizaDatosPedido("/diasCond", Number(this.byId("CondPago").getSelectedItem().getBindingContext("CondicionPago").getObject().CantidadDias));
          }
          this.actualizaDatosPedido("/condEnabled", true);
          this.actualizaDatosPedido("/condBusy", false);
        }).catch(error => {
          this.actualizaDatosPedido("/condBusy", false);
          MessageBox.error(error.responseText);
        });
      },

      //Fecha Preferente
      // ****************************************************************
      // ****************************************************************
      getFechaPreferente: function (newDate) {
        var pedido = this.getModel("pedido").getData();
        if (pedido.noDate) {
          return;
        }
        if (pedido.Kunnr === "" || pedido.clasePedido === "") {
          return;
        }
        if (newDate) {
          var url = "/FechaPreferenteEntregaSet(Kunnr='" + pedido.Kunnr + "',ClasePedido='" + pedido.clasePedido + "',FechaPE='" + newDate + "',Caloval='0')";
        } else {
          var url = "/FechaPreferenteEntregaSet(Kunnr='" + pedido.Kunnr + "',ClasePedido='" + pedido.clasePedido + "',FechaPE='',Caloval='1')";
        }
        var that = this;
        this.byId("FechaPedido").setBusy(true);

        this.byId("FechaPedido").setMinDate(new Date());
        // eslint-disable-next-line consistent-return
        return new Promise((resolve, reject) => {
          this.mainModel.read(url, {
            async: true,
            success: function (req, res) {
              console.log("fechaPreferenteLoaded");
              var date = res.data.FechaPE;
              that.actualizaDatosPedido("/fechaPreferente", date);
              that.actualizaDatosPedido("/fechaEnabled", true);
              that.primeDate = res.data.FechaPE;
              that.byId("FechaPedido").setBusy(false);
              resolve()
            },
            error: function (error) {
              MessageBox.error(error.responseText);
              that.byId("FechaPedido").setBusy(false);
              that.byId("FechaPedido").setEnabled(false);
              reject()
            },
          });
        })
      },


      //Lista Materiales
      // ****************************************************************
      // ****************************************************************

      //Materials Load
      // ****************************************************************
      getMatData: function () {
        this.actualizaDatosPedido("/matBusy", true);
        var pedido = this.getModel("pedido").getData();
        var oFilter = [
          new Filter("Kunnr", sap.ui.model.FilterOperator.EQ, pedido.Kunnr),
          new Filter("OrganizacionVentas", sap.ui.model.FilterOperator.EQ, pedido.OrganizacionVenta),
          new Filter("CanalDistribucion", sap.ui.model.FilterOperator.EQ, pedido.CanalDistribucion),
          new Filter("ClienteRol", sap.ui.model.FilterOperator.EQ, pedido.ClienteRol),
        ];
        this.createMatFrag(); //Creacion prematura por carga lenta
        this.getOdataAsModel("MaterialSet", oFilter).then((res) => {
          res.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
          this.getView().setModel(res, "matModel");
          console.log("materiales Loaded");
          this.actualizaDatosPedido("/matBusy", false);
        });
        this.clearMatTab();
      },
      clearMatTab: function () {
        this.initMatTableModel();
      },
      //Get Material prices on quantity input
      // ****************************************************************      
      getMatPrice: function (arrMatnr) {
        console.log("get Mat Price");
        var pedido = this.getModel("pedido").getData();
        var matPrice = [];
        if (!this.matPriceDic) this.matPriceDic = Object.create(null);
        return new Promise((resolve, reject) => {
          arrMatnr.forEach((material) => {
            if (
              !this.matPriceDic[material.Matnr] ||
              this.matPriceDic[material.Matnr].Cantidad !== material.Cantidad
            ) {
              matPrice.push({
                Matnr: material.Matnr,
                Cantidad: (material.Cantidad * 1000).toString(),
                // Meins: material.Meins,
                Cliente: pedido.Kunnr,
                Clase: pedido.clasePedido,
                Organizacion: pedido.OrganizacionVenta,
                Canal: pedido.CanalDistribucion,
              });
            }
          });
          if (matPrice.length === 0) {
            resolve();
            return;
          }
          var oPayload = {
            Matnr: arrMatnr.length.toString(),
            to_precios: matPrice,
          };
          var that = this;
          // e.g. received price
          // "Bruto": "  13733.5000"
          // "Canal": "A4"
          // "Cantidad": "151000"
          // "Clase": "ZADS"
          // "Cliente": "1000158"
          // "Cond1": "      0.0000"
          // "Cond2": "      0.0000"
          // "Cond3": "      0.0000"
          // "Iva": ""
          // "Lbkum": ""
          // "Matnr": "40005325"
          // "Meins": ""
          // "Neto": "  14623.4300"
          // "Organizacion": "AR10"
          // "Precio": "12085.48"
          // "Promo": "   1648.0200-"
          // "Umrez": ""
          // "Vrkme": ""
          const parsePromo = (val) => {
            if (val) {
              var recorte = val.trim();
              if (recorte[recorte.length - 1] === "-") {
                return Number(recorte.substring(0, recorte.length - 1));
              } else {
                return Number(val);
              }
            }
          };
          var numField = ["Bruto", "Cantidad", "Cond1", "Cond2", "Cond3", "Iva", "Lbkum", "Matnr", "Neto", "Precio"];
          that.mainModel.setUseBatch(false);
          that.mainModel.create("/PrecioSet", oPayload, {
            success: function (req, res) {
              var localDic = Object.create(null);
              //results
              res.data.to_precios.results.forEach((element) => {
                localDic.Init = true;
                localDic[element.Matnr] = element;
              });
              if (localDic.Init) {
                arrMatnr.forEach((material) => {
                  if (localDic[material.Matnr]) {
                    that.matPriceDic[material.Matnr] = material;
                    that.matPriceDic[material.Matnr].Precio = localDic[material.Matnr].Precio;
                    that.matPriceDic[material.Matnr].Bon = Number(localDic[material.Matnr].Qpromo);
                    that.matPriceDic[material.Matnr].NoBon = that.matPriceDic[material.Matnr].Cantidad - that.matPriceDic[material.Matnr].Bon;
                    that.matPriceDic[material.Matnr].Moneda = localDic[material.Matnr].Currency;
                    if (localDic[material.Matnr]) {
                      var matPrices = localDic[material.Matnr];
                      for (const key in matPrices) {
                        if (Object.hasOwnProperty.call(matPrices, key)) {
                          if (numField.includes(key)) {
                            matPrices[key] = Number(matPrices[key]);
                          } else if (key === "Promo") {
                            matPrices[key] = parsePromo(matPrices[key]);
                          }
                        }
                      }
                    }
                    that.matPriceDic[material.Matnr].precioInfo = localDic[material.Matnr];
                  }
                  resolve();
                });
              }
            },
            error: function (error) {
              MessageBox.error(error.responseText);
              reject(error);
            },
          });
        });
      },
      //Search Help---------------------------------------------
      // ****************************************************************
      fragInit: function (oEvent) {
        console.log("init Fragment");
        if (!this.fragTabManagement) {
          this.fragTabManagement = {};
        }
        this.fragTabManagement = {
          cleanedTab1: false,
          cleanedTab2: false
        };
        var tab = this.getView().byId("tab").getSelectedKey();
        this.setCleanedTab(tab);
      },
      //Clean tab on tab selection changed
      // ****************************************************************
      createMatFrag: function (oEvent) {
        console.log("Frag Loading...");
        if (!this.byId("MatSH")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "godrej.pedidoscrea.view.MatSH",
            controller: this,
          }).then(
            function (oDialog) {
              // connect dialog to the root view of this component (models, lifecycle)
              this.getView().addDependent(oDialog);
              console.log("Frag Loaded");
              this.DialogLoaded = true;
              // oDialog.open();
            }.bind(this)
          );
        }
      },
      setCleanedTab: function (tab) {
        if (tab.includes("2") && !this.fragTabManagement.cleanedTab2) {
          this.clearInputs();
          this.fragTabManagement.cleanedTab2 = true;
          console.log("cleaned tab 2");
        }
        if (tab.includes("1") && !this.fragTabManagement.cleanedTab1) {
          this.clearInputs();
          this.fragTabManagement.cleanedTab1 = true;
          console.log("cleaned tab 1");
        }
      },
      onFragIconSelected: function (oEvent) {
        console.log("Event Handler: onFragIconSelected");
        var tab = oEvent.getParameter("selectedKey");
        this.setCleanedTab(tab);
      },
      onHelpMat: function (oEvent) {
        console.log("Event Handler: onHelpMat");
        var nodeMat = this.setInitNodes(this.crearNodo());
        var oModel = new JSONModel(nodeMat);
        this.getView().setModel(oModel, "Nodes");
        if (this.DialogLoaded) {
          this.byId("MatSH").open();
        } else {
          MessageToast.show(this.getResourceBundle().getText("fragLoading"));
        }
      },
      fragMatInput: function (oEvent, param) {
        console.log("Event Handler: fragMatInput");
        var newVal = oEvent.getParameter("value");
        if (!this.fragMatTable) {
          this.fragMatTable = [];
        }
        if (param === "tree") {
          var selMat = this.getModel("Nodes").getProperty(oEvent.getSource().getBindingContext("Nodes").sPath);
        } else {
          var selMat = this.getModel("matModel").getProperty(oEvent.getSource().getBindingContext("matModel").sPath);
        }
        selMat.Cantidad = Number(newVal);
        selMat.Cantidad = (isNaN(selMat.Cantidad) ? 0 : selMat.Cantidad);

        var selIdx = this.fragMatTable.findIndex(function (mat) {
          return mat.Matnr === selMat.Matnr;
        });
        if (selIdx > -1) {
          if (!selMat.Cantidad > 0) {
            this.fragMatTable = this.fragMatTable.slice(selIdx, 1);
          } else {
            this.fragMatTable[selIdx].Cantidad = selMat.Cantidad;
          }
        } else {
          this.fragMatTable.push(selMat);
        }
        console.log(this.fragMatTable);
      },
      onFiltrarMateriales: function (oEvent) {
        if (this.fragMatTable) {
          this.manageBlink();
          this.cargaMaterialesSeleccionados();
          this.clearInputs(true);
        }
        //filtro del value help de materiales
        var oQuery = oEvent.getSource().getValue();
        var datos = this.getView().byId("idFragTable").getBinding("items");
        var filtro = null;
        if (oQuery) {
          filtro = new Filter(
            [
              new Filter("Matnr", FilterOperator.Contains, oQuery),
              new Filter("Descripcion", FilterOperator.Contains, oQuery),
              new Filter("Jerarquia", FilterOperator.Contains, oQuery),
            ],
            false
          );
        }
        datos.filter(filtro, "Application");
      },
      onHandleValueHelpTomar: function (oEvent) {
        console.log("Event Handler: onHandleValueHelpTomar");
        this.cargaMaterialesSeleccionados();
        this.byId("MatSH").close();
      },
      manageBlink: function (oEvent) {
        this.getView().byId("blinkLabel").setText("Materiales Agregados");
        setTimeout(() => {
          this.getView().byId("blinkLabel").setText("");
        }, 2000);
      },
      clearInputs: function (search) {
        $(".valFragInput").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          oControl.setValue("");
        });
      },
      cargaMaterialesSeleccionados: function (oEvent, table = "fragMatTable") {
        var materiales = this.getView().getModel("materiales").getProperty("/");
        // ****************************************************************
        // Must clone the array otherwise it will link to main tab and propagate changes
        // ****************************************************************
        var materialesUpdate = JSON.parse(JSON.stringify(materiales));
        // ****************************************************************
        var loaded = 0;
        this[table].filter((material) => {
          return (
            material.Cantidad > 0 &&
            this.valDuplicate(
              undefined,
              this.actionOnDuplicateFrag,
              material,
              materialesUpdate
            )
          );
        }).forEach((material) => {
          loaded++;
          materialesUpdate.push(material);
        });
        this[table] = [];
        this.getView().getModel("materiales").setProperty("/", materialesUpdate);
        return loaded;
      },
      actionOnDuplicateFrag: function (undefined, res) {
        return res === "Error" ? false : true;
      },
      //Jerarquia
      // ****************************************************************
      crearNodo: function () {
        var materiales = this.getView().getModel("matModel").getProperty("/");
        var materialesToHier = JSON.parse(JSON.stringify(materiales));
        // let hierTable = Object.create(null);
        let hierTable = [];
        const nodeInsert = (hashTable, node, jName, Matnr) => {
          if (!Matnr) {
            hashTable.push({
              ...node,
            });
            return hashTable;
          } else {
            if (!hashTable[node[jName]]) {
              hashTable[node[jName]] = {
                Matnr: node[Matnr],
                children: jName.includes("4") ? [] : Object.create(null),
              };
            }
          }
          return hashTable[node[jName]].children;
        };

        materialesToHier.forEach((material) => {
          if (material.Jerarquia1) {
            delete material.__metadata;
            var h1 = nodeInsert(hierTable, material, "Jerarquia1", "Texto1");
            var h2 = nodeInsert(h1, material, "Jerarquia2", "Texto2");
            var h3 = nodeInsert(h2, material, "Jerarquia3", "Texto3");
            var h4 = nodeInsert(h3, material, "Jerarquia4", "Texto4");
            material.NodeLevel = 5;
            nodeInsert(h4, material, "Matnr");
          } else {
            console.log(material.Matnr + " " + material.Descripcion);
          }
        });
        return hierTable;
      },
      setInitNodes: function (oHierTable) {
        var nChildren = [];
        for (const key in oHierTable) {
          nChildren.push(oHierTable[key]);
        }
        return nChildren.sort((a, b) => (a.Matnr > b.Matnr ? 1 : -1));
      },
      openNode: function (oEvent) {
        var sPath = oEvent.getParameter("rowContext").sPath;
        var id = this.getView().getModel("Nodes").getProperty(sPath);
        if (oEvent.getParameter("expanded")) {
          var nChildren = [];
          if (id) {
            for (const key in id.children) {
              nChildren.push(id.children[key]);
            }
            var sort = nChildren[0] && nChildren[0].Descripcion ? "Descripcion" : "Matnr";
            id.children = nChildren.sort((a, b) =>
              a[sort] > b[sort] ? 1 : -1
            );
          }
        }
        this.getView().getModel("Nodes").refresh();
      },
      //Search Help END---------------------------------------------


      //Input directo usando sugerencias----------------------------
      // ****************************************************************
      handleMatSuggest: function (oEvent) {
        var oQuery = oEvent.getParameter("suggestValue");
        var filtro = null;
        if (oQuery) {
          filtro = new Filter(
            [
              new Filter("Matnr", FilterOperator.Contains, oQuery),
              new Filter("Descripcion", FilterOperator.Contains, oQuery),
              new Filter("Jerarquia", FilterOperator.Contains, oQuery),
            ],
            false
          );
        }
        oEvent.getSource().getBinding("suggestionRows").filter(filtro);
        oEvent.getSource().setFilterSuggests(false);
      },
      onMatLiveChange: function (oEvent) {
        console.log("Event Handler: onMatLiveChange");
        var materiales = this.getView().getModel("materiales");
        var data = materiales.getProperty(
          oEvent.getSource().getParent().getBindingContextPath("materiales")
        );
        if (data.OrganizacionVenta) {
          materiales.setProperty(
            oEvent.getSource().getParent().getBindingContextPath(),
            this.newLine()
          );
        }
      },
      cargaMaterialData: function (oData, oControl) {
        var data;
        if (Array.isArray(oData)) {
          data = oData[0];
        } else {
          data = oData;
        }
        data.Cantidad = 0;
        this.getModel("materiales").setProperty(
          oControl.getParent().getBindingContextPath(),
          data
        );
      },
      ingresoInput: function (oEvent) {
        //comprobar si el valor que puso en el input es un material
        var selMaterial = this.getModel("matModel").getProperty(
          oEvent.getParameter("selectedRow").getBindingContextPath("matModel")
        );
        if (this.valDuplicate(oEvent, this.actionOnDuplicate)) {
          this.cargaMaterialData(selMaterial, oEvent.getSource());
        }
      },
      actionOnDuplicate: function (oEvent, action) {
        oEvent.getSource().setValueState(action);
      },
      valDuplicate: function (oEvent, oFn, codMat, materiales) {
        if (!codMat) {
          codMat = this.getModel("matModel").getProperty(
            oEvent.getParameter("selectedRow").getBindingContextPath("matModel")
          );
        }
        if (!materiales) {
          materiales = this.getView().getModel("materiales").getData();
        }
        var i = materiales
          .map(function (e) {
            return e.Matnr;
          })
          .indexOf(codMat.Matnr);
        if (i >= 0) {
          oFn(oEvent, "Error");
          return false;
        } else {
          oFn(oEvent, "None");
          return true;
        }
      },
      //Input directo usando sugerencias END----------------------------

      // ****************************************************************
      // ****************************************************************

      //Actualiza tabla
      // ****************************************************************
      onUpdateFinishedTablaMateriales: function (oEvent) {
        // Direct update posible, no calculations requiered
        this.actualizaDatosPedido("/totalItems", this.byId("Postable").getItems().length);
        if (!this.afterPedido) {
          console.log("Event Handler: onUpdateFinishedTablaMateriales");
          this._oTable.getItems().forEach((item) => {
            var oCantInput = item.getAggregation("cells").find(x => x.sId.includes("hboxCant")).getAggregation("items").find(x => x.sId.includes("CantInput"));
            if (oCantInput.getValue() > 0) {
              this.onMaterialCantidadChange(undefined, oCantInput);
            }
          });
          this.updateTitle(this._oTable.getItems().length);
          this.updateHeader();
        } else {
          delete this.afterPedido;
        }
      },

      //borra linea por boton borrar
      // ****************************************************************
      borrarMaterial: function (oEvent) {
        var materiales = this.getView().getModel("materiales").getProperty("/");
        var i = parseInt(
          oEvent.getParameter("listItem").getBindingContextPath("materiales").slice(1)
        );
        materiales.splice(i, 1);
        this.getView().getModel("materiales").setProperty("/", materiales);
      },

      // Validacion de input cantidad
      // ****************************************************************
      estadoImpCantidad: function (oEvent) {
        console.log("Event Handler: estadoImpCantidad");
        var oInput = oEvent.getSource();
        var displayTxt = oInput.getValue().replace(/\D/g, "");
        if (displayTxt === "") displayTxt = 0;
        oInput.setValue(parseFloat(displayTxt));
        this.updateHeader();
        this.onInputLiveChange(oEvent);
      },
      // Enable access to mat prices 
      // ****************************************************************
      onMaterialCantidadChange: function (oEvent, oControl) {
        console.log("Event Handler: onMaterialCantidadChange");
        // this.getMatData();
        if (this.getModel("pedido").getData().clasePedido === "") {
          MessageToast.show(this.validaCampos());
        } else {
          if (oControl) {
            var material = oControl.getBindingContext("materiales").getObject()
            oControl.setValue((this.valMinimum(oControl.getValue(), Number(material.Umrez))));
            this.loadPriceMat(oControl);
            oControl.getParent().getParent().getAggregation("cells").find(x => x.sId.includes("total")).addStyleClass("labelEvent");
          } else {
            var cells = oEvent.getSource().getParent().getParent().getAggregation("cells");
            if (oEvent.getParameter("value") > 0 && cells[1].getValue()) {
              var material = oEvent.getSource().getBindingContext("materiales").getObject()
              oEvent.getSource().setValue((this.valMinimum(oEvent.getSource().getValue(), Number(material.Umrez))));
              this.loadPriceMat(oEvent.getSource());
              cells.find(x => x.sId.includes("_IDGenIcon1")).setColor("green");
              cells.find(x => x.sId.includes("total")).addStyleClass("labelEvent");
            } else {
              cells.find(x => x.sId.includes("_IDGenIcon1")).setColor("");
              cells.find(x => x.sId.includes("total")).removeStyleClass("labelEvent");
            }
          }
        }
      },
      valMinimum: function (curr, min) {
        min = (isNaN(min) ? 0 : min);
        if (curr >= min) {
          return curr;
        } else {
          MessageToast.show(this.getResourceBundle().getText("unidadMinima", min));
          return min;
        };
      },

      // Calcula y Actualiza totales
      // ****************************************************************
      updateHeader: function () {
        var data = this.getModel("materiales").getData();
        var total = data.reduce(
          (totales, material) => {
            // totales.Cantidad = parseFloat(totales.Cantidad) + material.Precio * material.Cantidad;
            totales.Unidad = totales.Unidad + parseFloat(material.Cantidad);
            return totales;
          }, {
            // Cantidad: 0,
            Unidad: 0
          }
        );
        // Price is not bound to material table model
        var totales = this.getTotal();

        this.actualizaDatosPedido("/totalCant", this.formatter.format(totales.monto));
        this.actualizaDatosPedido("/cantUnit", totales.unit);
        this.actualizaDatosPedido("/totalUnidad", this.formatter.format(Number.isNaN(total.Unidad) ? 0 : total.Unidad));
      },
      getTotal: function () {
        var total = {
          monto: 0,
          unit: ""
        };
        $(".valTotal").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          total.monto = total.monto + Number(oControl.getNumber().replaceAll(",", ";").replaceAll(".", "").replaceAll(";", "."));
          total.unit = oControl.getUnit();
        });
        return total;
      },


      // Mat Prices
      // ****************************************************************
      // ****************************************************************
      // Request for material prices
      // ****************************************************************
      loadPriceMat: function (oControl) {
        oControl.getParent().setBusy(true);
        var selMaterial = this.getModel("materiales").getProperty(
          oControl.getBindingContext("materiales").sPath
        );

        this.getMatPrice([{
            ...selMaterial
          }])
          .then(() => {
            oControl.getParent().setBusy(false);
            var cells = oControl.getParent().getParent().getAggregation("cells");
            var matnr = cells.find(x => x.sId.includes("mat")).getValue();
            var oTotal = cells.find(x => x.sId.includes("total"));
            var oBon = cells.find(x => x.sId.includes("bon"));
            var oNoBon = cells.find(x => x.sId.includes("nobon"));
            var matWithPrice = this.matPriceDic[matnr];
            if (matWithPrice) {
              oBon.setNumber(this.matPriceDic[matnr].Bon);
              oNoBon.setNumber(this.matPriceDic[matnr].NoBon);
              oTotal.setNumber(this.formatter.format(Number(this.matPriceDic[matnr].Precio).toFixed(2)));
              oTotal.setUnit(this.matPriceDic[matnr].Moneda);
              matWithPrice.precioInfo.Unit = this.matPriceDic[matnr].Moneda;
              this.updateHeader();
            } else {
              oTotal.setNumber(Number(0).toFixed(2));
            }
          })
          .catch((error) => {
            MessageBox.error(this.getResourceBundle().getText("noPrice"));
            oControl.getParent().setBusy(false);
          });
      },
      onHandlePricesClose: function (oEvent, param) {
        this.byId("MatPrice").close();
        if (param) {
          this.byId("MatPrice").destroy();
        }
      },
      onHandlePrice: function (oEvent) {
        var selMat = this.getModel("materiales").getProperty(
          oEvent.getSource().getBindingContext("materiales").sPath
        );
        var priceData = this.matPriceDic[selMat.Matnr];
        if (priceData) {
          priceData.precioInfo.srcObject = oEvent.getSource().getParent();
          var fragModel = new JSONModel(priceData.precioInfo);
          this.getView().setModel(fragModel, "matPrice");
          console.log("setModel");

          Fragment.load({
            id: this.getView().getId(),
            name: "godrej.pedidoscrea.view.MatPrice",
            controller: this,
          }).then(
            function (oDialog) {
              // connect dialog to the root view of this component (models, lifecycle)
              this.getView().addDependent(oDialog);
              console.log("Frag Price Loaded");
              oDialog.open();
            }.bind(this)
          );
        }
        // }
      },

      // Utilidades
      // ****************************************************************
      // ****************************************************************

      //Regresa promesa de odata
      // ****************************************************************
      getOdataAsModel: function (oEntitySet, oFilter) {
        return new Promise((resolve, reject) => {
          this.mainModel.setUseBatch(false);
          this.mainModel.read("/" + oEntitySet, {
            async: true,
            filters: oFilter,
            success: function (req, res) {
              resolve(new JSONModel(res.data.results));
            },
            error: function (error) {
              MessageBox.error(error.responseText);
              reject(error);
            },
          });
        });
      },

      //función de acceso generico campos input
      // ****************************************************************
      onInputLiveChange: function (oEvent, param) {
        console.log("Event Handler: onInputLiveChange");
        this.valueState(oEvent.getSource());
        if (param === "fecha") {
          var newDate = this.formatDate(oEvent.getSource().getDateValue());
          if (this.getModel("pedido").getData().pais.includes("AR")) {
            this.getFechaPreferente(newDate).then((res) => {
              if (newDate < this.primeDate) {
                oEvent.getSource().setValueStateText(this.getResourceBundle().getText("fechaWarning"));
                oEvent.getSource().setValueState("Warning");
              } else {
                oEvent.getSource().setValueState("None");
              }
            });
          }
        }
      },
      onSelectionChangeComboBox: function (oEvent, comboName, key) {
        console.log("Event Handler: onSelectionChangeComboBox");
        var pedido = this.getModel("pedido").getData();
        if (comboName === "condPago") {
          var newDiasCond = Number(oEvent.getSource().getSelectedItem().getBindingContext("CondicionPago").getObject().CantidadDias);
          if (newDiasCond > pedido.diasCond) {
            oEvent.getSource().setValueStateText(this.getResourceBundle().getText("condicionNoValida"));
            oEvent.getSource().setValueState("Error");
            var comboBox = oEvent.getSource();
            setTimeout(() => {
              comboBox.setSelectedKey(pedido.condPago);
              setTimeout(() => {
                comboBox.setValueState("None");
              }, 1000).bind(this);
            }, 500).bind(this);
            return;
          }
        }
        if (comboName === "clasePedido") {
          var pais = oEvent.getSource().getSelectedItem().getBindingContext("clasePedidos").getObject().OrganizacionVenta;
          this.actualizaDatosPedido("/OrganizacionVenta", pais);
          // if (pais.includes("AR")) {
          //   // this.actualizaDatosPedido("/noDate", true);
          //   // this.byId("FechaPedido").setDateValue(this.getFechaPreferente(undefined).then((res) => (console.log(res))));
          // }
        }
        this.valueState(oEvent.getSource());
        this.actualizaDatosPedido("/" + comboName, key ? oEvent.getSource().getSelectedKey() : oEvent.getSource().getValue());
        if (comboName === "clasePedido" && oEvent.getSource().getSelectedKey() !== "") {
          this.actualizaDatosPedido("/clienteEnabled", true);
        } else {
          this.actualizaDatosPedido("/clienteEnabled", false);
        }
        if (comboName === "condPago") {

        }
      },
      valueState: function (oControl) {
        if (oControl.getValue() === "") {
          oControl.setValueState("Error");
        } else {
          oControl.setValueState("None");
        }
      },
      //función formato de fecha, recibe objetoDate
      // ****************************************************************
      formatDate: function (oDate) {
        if (oDate) {
          function parse(t, a) {
            function format(m) {
              let f = new Intl.DateTimeFormat("en", m);
              return f.format(t).padStart(2, "0");
            }
            return a.map(format);
          }
          var a = [{
            year: "numeric"
          }, {
            month: "numeric"
          }, {
            day: "numeric"
          }, ];
          let s = parse(oDate, a);
          return s[0] + s[1] + s[2];
        }
      },

      //Finalizar Pedido
      // ****************************************************************
      // ****************************************************************
      onGrabar: function () {
        console.log("Event Handler: onGrabar");
        var errorMessage = this.validaCampos();
        if (errorMessage !== undefined) {
          MessageToast.show(errorMessage);
          return;
        }
        errorMessage = this.validaMateriales();
        if (errorMessage !== undefined) {
          MessageToast.show(errorMessage);
          return;
        }
        this.onApproveDialogPress();
      },
      onApproveDialogPress: function () {
        if (!this.oApproveDialog) {
          this.oApproveDialog = new Dialog({
            type: DialogType.Message,
            icon: this.getResourceBundle().getText("submitIcon"),
            title: this.getResourceBundle().getText("submitConfirmation"),
            state: "Warning",
            content: new Text({
              text: this.getResourceBundle().getText("submitConfirmationQuestion")
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: this.getResourceBundle().getText("submitSend"),
              press: function () {
                this.sendOrder();
                this.oApproveDialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              text: this.getResourceBundle().getText("submitCancel"),
              press: function () {
                this.oApproveDialog.close();
              }.bind(this)
            })
          });
        }
        this.oApproveDialog.open();
      },
      sendOrder: function () {
        var data = this.getModel("pedido").getData();
        var fechaEntrega = this.formatDate(this.byId("FechaPedido").getDateValue());
        var pedido = {
          Vkorg: data.OrganizacionVenta,
          Vtweg: data.CanalDistribucion,
          Kunnr: data.Kunnr,
          Auart: data.clasePedido,

          // Spart: data.subCanal, //Sector
          Vkgrp: data.vendedor,
          Vkbur: data.oficinaDeVentas,

          Kunnr2: data.Kunnr,
          Bstkd: data.ordenCompra,
          Bstdk: "",
          Kprgbz: "",
          Ketdat: fechaEntrega,
          Zterm: data.condPago,
          FechaCambiada: (this.primeDate !== fechaEntrega ? "X" : "")
          // Valtg: data.NumeroDeDias,
        };
        var materiales = this.getModel("materiales").getData();
        var to_items = materiales.filter((material) => {
          if (material.Matnr && material.Matnr !== "") {
            delete material.NodeLevel;
            delete material.NoBon;
            delete material.Bon;
            material.Cantidad = material.Cantidad.toString();
            return material;
          }
        });
        pedido.to_items = to_items;
        var that = this;
        this.getView().setBusy(true);
        this.mainModel.create("/PedidoCabSet", pedido, {
          async: true,
          success: function (req, res) {
            that.getView().setBusy(false);
            if (res.data.Bstkd[0] === "S") {
              MessageBox.success(res.data.Bstkd.replace(/[0-9]/g, "") + parseInt(res.data.Bstkd.replace(/\D/g, "")));
              that.onCancelar(true)
            } else {
              MessageBox.error(res.data.Bstkd);
            }
          },
          error: function (error) {
            that.getView().setBusy(false);
            MessageBox.error(error.responseText);
          },
        });
      },
      onCancelar: function (initPedido) {
        this.clearMatTab();
        this.initPedido(initPedido, true);
        this.byId("tipopedidoMulti").setValue("");
        this.byId("tipopedidoMulti").setSelectedKey("");
        this.byId("client").setValue("");
        this.byId("CondPago").setValue("");
        console.log("Event Handler: onCancelar");
      },
      validaCampos: function () {
        var valError;
        $(".valInput, .valComboBox, .valDate").each((i, e) => {
          if (e.id.includes("FechaPedido") && this.getModel("pedido").getData().noDate) {
            return;
          }
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          if (oControl.getValue() === "") {
            oControl.setValueState("Error");
            valError = this.getResourceBundle().getText("camposVaceos");
          }
        });
        return valError;
      },
      validaMateriales: function () {
        var pedido = this.getModel("pedido").getData();
        var valError;
        if (pedido.totalUnidad === 0)
          return this.getResourceBundle().getText("pedidoVaceo");
      },

      //XLSX
      // ****************************************************************
      // ****************************************************************      
      onDownTemplate: function (oEvent) {
        console.log("Event Handler: onDownTemplate");
        var matHeader = this.getResourceBundle().getText("NoMat"),
          cantHeader = this.getResourceBundle().getText("Cant");
        var template = [{
          [matHeader]: "",
          [cantHeader]: ""
        }];
        var ws = XLSX.utils.json_to_sheet(template);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws);
        var fn = this.getResourceBundle().getText("templateTitle") + ".xlsx";
        XLSX.writeFile(wb, fn, {
          "cellDates": true
        });
      },
      onHandleUploadStart: function (oEvent) {
        if (oEvent.getParameter("newValue") !== "") {
          this.file = oEvent.getParameter("files")[0];
          console.log("Event Handler: onHandleUploadStart");
          this.getView().byId("cargaXLSX").setVisible(true);
        }
      },
      onHandleUploadComplete: function (oEvent) {
        console.log("Event Handler: onHandleUploadComplete");
        // var oFileUploader = thisFocusDomRef().files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
          // pre-process data
          var binary = "";
          // if (sap.ui.Device.browser.name === "ie") {
          //   var bytes = Uint8Array(e.target.result);
          // } else {
          var bytes = new Uint8Array(e.target.result);
          // }
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }

          var workbook = XLSX.read(binary, {
            type: "binary",
            cellDates: true,
            cellNF: false,
            cellText: false,
          });
          var worksheet = workbook.Sheets[workbook.SheetNames[0]];
          var jsonObj = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: "DD-MMM-YYYY",
          });

          // XLSX loaded and read
          this.actualizaDatosPedido("/clienteEnabled", false);
          this.actualizaDatosPedido("/matBusy", true);
          var loadedMat = [],
            rejected = [];
          var modelMat = this.getView().getModel("matModel").getData();
          var materiales = JSON.parse(JSON.stringify(modelMat));
          if (!this.matDicXLSX) {
            this.matDicXLSX = Object.create(null);
            for (let index = 0; index < materiales.length; index++) {
              this.matDicXLSX[materiales[index].Matnr] = materiales[index];
            };
          }
          var matHeader = this.getResourceBundle().getText("NoMat"),
            cantHeader = this.getResourceBundle().getText("Cant"),
            xlsxCantError = this.getResourceBundle().getText("xlsxCantError"),
            xlsxMatError = this.getResourceBundle().getText("xlsxMatError");
          jsonObj.forEach((material) => {
            var cantidad = Number(material[cantHeader]);
            if (isNaN(cantidad)) {
              material.error = xlsxCantError;
              rejected.push(material);
            } else {
              var noZeroMat = Number(material[matHeader]);
              if (this.matDicXLSX[noZeroMat]) {
                var addedMat = this.matDicXLSX[noZeroMat];
                addedMat.Cantidad = material[cantHeader];
                loadedMat.push(addedMat);
              } else {
                material.error = xlsxMatError;
                rejected.push(material);
              }
            }
          });
          this.xlsxMatTable = loadedMat;
          if (this.xlsxMatTable.length > 0) {
            var loaded = this.cargaMaterialesSeleccionados(undefined, "xlsxMatTable");
          }
          this.showImportMessage(loadedMat.length, loaded, rejected);

          this.actualizaDatosPedido("/clienteEnabled", true);
          this.actualizaDatosPedido("/matBusy", false);
          this.getView().byId("cargaXLSX").setVisible(false);
        }.bind(this);
        reader.onerror = function (err) {
          this.actualizaDatosPedido("/clienteEnabled", true);
          this.actualizaDatosPedido("/matBusy", false);
        }.bind(this);
        // reader.readAsDataURL(this.file);
        reader.readAsArrayBuffer(this.file);
      },
      showImportMessage: function (success, noDupla = 0, error) {
        var that = this;
        var eList = new sap.m.List().addStyleClass("listNoBorder pdng");
        var matHeader = this.getResourceBundle().getText("NoMat");
        var msg = error,
          j;
        for (j = 0; j < msg.length; j++) {
          eList.addItem(
            new sap.m.CustomListItem({
              content: new sap.m.HBox({
                width: "100%",
                items: new sap.m.HBox({
                  items: new sap.m.Label({
                    text: msg[j][matHeader] + ": " + msg[j].error
                  })
                }).addStyleClass("eListPdng")
              })
            }));
        };
        var matAdded = this.getResourceBundle().getText("matAdded");
        var matLoaded = this.getResourceBundle().getText("matLoaded");
        var matDuplicated = this.getResourceBundle().getText("matDuplicated");
        var matRejected = this.getResourceBundle().getText("matRejected");
        this.xlsxDialog = new sap.m.Dialog({
          content: new sap.m.VBox({
            items: [new sap.m.Label({
                text: matAdded + " " + noDupla,
                design: "Bold"
              }).addStyleClass("uploaderMargin").addStyleClass("sapUiTinyMarginTop"),
              new sap.m.Label({
                text: matLoaded + " " + success,
              }).addStyleClass("uploaderMargin"),
              new sap.m.Label({
                text: matDuplicated + " " + (success - noDupla),
                visible: ((success - noDupla) > 0 ? true : false)
              }).addStyleClass("uploaderMargin"),
              new sap.m.Label({
                text: matRejected + " " + error.length,
                visible: (error.length > 0 ? true : false)
              }).addStyleClass("uploaderMargin")
            ]
          }),
          state: (error.length > 0 || (success - noDupla) > 0 ? "Warning" : "Success"),
          beginButton: new sap.m.Button({
            press: function () {
              that.xlsxDialog.close();
            },
            text: "Ok",
          }),
        }).addStyleClass("dialogPdng");
        this.getView().addDependent(this.xlsxDialog);
        if (error.length > 0) this.xlsxDialog.addContent(eList);
        this.xlsxDialog.open();
      },
      onUploadCancel: function (oEvent) {
        this.getView().byId("cargaXLSX").setVisible(false);
      },

      onFragPromoSelected: function (oEvent) {
        this.byId("MatPrice").setBusy(true);
        this.byId("fragPromo").setVisible(!oEvent.getParameter("selected"));
        var prices = this.getModel("matPrice").getData();
        var newPrice = 0,
          Bon = 0,
          NoBon = 0;
        var matLine = prices.srcObject.getBindingContext("materiales").getObject();
        if (oEvent.getParameter("selected")) {
          NoBon = Number(matLine.NoBon) + Number(matLine.Bon);
          Bon = 0;
          newPrice = prices.Bruto;
          prices.NoPromo = "X";
        } else {
          NoBon = Number(matLine.NoBon) - Number(prices.Qpromo);
          Bon = Number(prices.Qpromo);
          newPrice = prices.Precio;
          prices.NoPromo = "";
        }
        this.getModel("matPrice").setProperty("/", prices);
        this.getModel("materiales").setProperty(prices.srcObject.getBindingContext("materiales").sPath + "/Bon", Bon);
        this.getModel("materiales").setProperty(prices.srcObject.getBindingContext("materiales").sPath + "/NoBon", NoBon);
        this.getModel("materiales").setProperty(prices.srcObject.getBindingContext("materiales").sPath + "/NoPromo", prices.NoPromo);
        prices.srcObject.getAggregation("cells").find(x => x.sId.includes("total")).setNumber(this.formatter.format(Number(newPrice).toFixed(2)));
        this.updateHeader();
        this.byId("MatPrice").setBusy(false);
      }
    });
  }
);