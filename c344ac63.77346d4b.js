(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{120:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return b})),a.d(t,"metadata",(function(){return c})),a.d(t,"rightToc",(function(){return i})),a.d(t,"default",(function(){return l}));var r=a(2),n=(a(0),a(126));const b={id:"modbus",title:"Modbus Adaptor"},c={id:"adaptors/modbus",title:"Modbus Adaptor",description:"## Introduction",source:"@site/docs/adaptors/modbus.md",permalink:"/docs-octopus/docs/adaptors/modbus",editUrl:"https://github.com/rancheredge/docs-octopus/edit/master/website/docs/adaptors/modbus.md",sidebar:"docs",previous:{title:"BLE Adaptor",permalink:"/docs-octopus/docs/adaptors/ble"},next:{title:"OPC-UA Adaptor",permalink:"/docs-octopus/docs/adaptors/opc-ua"}},i=[{value:"Introduction",id:"introduction",children:[]},{value:"Registration Information",id:"registration-information",children:[]},{value:"Support Model",id:"support-model",children:[]},{value:"Support Platform",id:"support-platform",children:[]},{value:"Usage",id:"usage",children:[]},{value:"Authority",id:"authority",children:[]},{value:"Modbus Protocol",id:"modbus-protocol",children:[]},{value:"Registers Operation",id:"registers-operation",children:[]},{value:"DeviceLink CRD",id:"devicelink-crd",children:[{value:"Parameters",id:"parameters",children:[]},{value:"Property Visitor",id:"property-visitor",children:[]}]}],o={rightToc:i};function l({components:e,...t}){return Object(n.b)("wrapper",Object(r.a)({},o,t,{components:e,mdxType:"MDXLayout"}),Object(n.b)("h2",{id:"introduction"},"Introduction"),Object(n.b)("p",null,"Modbus Adaptor is used for connecting to and manipulating modbus devices on the edge.\nModbus Adaptor supports TCP and RTU protocol."),Object(n.b)("h2",{id:"registration-information"},"Registration Information"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Versions"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Register Name"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Endpoint Socket"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Available"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"v1alpha1")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"adaptors.edge.cattle.io/modbus")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"modbus.socket")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),"*")))),Object(n.b)("h2",{id:"support-model"},"Support Model"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Kind"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Group"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Version"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Available"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"ModbusDevice")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"devices.edge.cattle.io")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"v1alpha1")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),"*")))),Object(n.b)("h2",{id:"support-platform"},"Support Platform"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"OS"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Arch"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"linux")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),Object(n.b)("inlineCode",{parentName:"td"},"amd64"))),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"linux")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),Object(n.b)("inlineCode",{parentName:"td"},"arm"))),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),Object(n.b)("inlineCode",{parentName:"td"},"linux")),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),Object(n.b)("inlineCode",{parentName:"td"},"arm64"))))),Object(n.b)("h2",{id:"usage"},"Usage"),Object(n.b)("pre",null,Object(n.b)("code",Object(r.a)({parentName:"pre"},{className:"language-shell",metastring:"script",script:!0}),"kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/modbus/deploy/e2e/all_in_one.yaml\n")),Object(n.b)("h2",{id:"authority"},"Authority"),Object(n.b)("p",null,"Grant permissions to Octopus as below:"),Object(n.b)("pre",null,Object(n.b)("code",Object(r.a)({parentName:"pre"},{className:"language-text"}),"  Resources                                   Non-Resource URLs  Resource Names  Verbs\n  ---------                                   -----------------  --------------  -----\n  modbusdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]\n  modbusdevices.devices.edge.cattle.io/status  []                 []              [get patch update]\n")),Object(n.b)("h2",{id:"modbus-protocol"},"Modbus Protocol"),Object(n.b)("p",null,"Modbus is a master/slave protocol.\nThe device requesting the information is called the Modbus Master and the devices supplying information are Modbus Slaves.\nIn a standard Modbus network, there is one Master and up to 247 Slaves, each with a unique Slave Address from 1 to 247.\nThe Master can also write information to the Slaves."),Object(n.b)("p",null,"In Modbus Adaptor, the adaptor as the master connects to modbus slave devices\u3002"),Object(n.b)("h2",{id:"registers-operation"},"Registers Operation"),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Coil Registers"),": readable and writable, 1 bit (off/on)"),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Discrete Input Registers"),": readable, 1 bit (off/on)"),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Input Registers"),": readable, 16 bits (0 to 65,535), essentially measurements and statuses"),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Holding Registers"),": readable and writable, 16 bits (0 to 65,535), essentially configuration values"),Object(n.b)("h2",{id:"devicelink-crd"},"DeviceLink CRD"),Object(n.b)("p",null,"example deviceLink CRD"),Object(n.b)("pre",null,Object(n.b)("code",Object(r.a)({parentName:"pre"},{className:"language-yaml"}),'apiVersion: edge.cattle.io/v1alpha1\nkind: DeviceLink\nmetadata:\n  name: modbus-tcp\nspec:\n  adaptor:\n    node: edge-worker\n    name: adaptors.edge.cattle.io/modbus\n  model:\n    apiVersion: "devices.edge.cattle.io/v1alpha1"\n    kind: "ModbusDevice"\n  template:\n    metadata:\n      labels:\n        device: modbus-tcp\n    spec:\n      protocol:\n        tcp:\n          ip: 192.168.1.3\n          port: 502\n          slaveID: 1\n      properties:\n        - name: temperature\n          description: data collection of temperature sensor\n          readOnly: false\n          visitor:\n            register: HoldingRegister\n            offset: 2\n            quantity: 8\n          value: "33.3"\n          dataType: float\n        - name: temperature-enable\n          description: enable data collection of temperature sensor\n          readOnly: false\n          visitor:\n            register: CoilRegister\n            offset: 2\n            quantity: 1\n          value: "true"\n          dataType: boolean\n\n')),Object(n.b)("h3",{id:"parameters"},"Parameters"),Object(n.b)("h4",{id:"tcp-config"},"TCP Config"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Parameter"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Description"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Type"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"ip"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"ip address of the device"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"string")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"port"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"tcp port of the device"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"slaveId"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"slave id of the device"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int")))),Object(n.b)("h4",{id:"rtu-config"},"RTU Config"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Parameter"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Description"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Type"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Default"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"serialPort"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"Device path (e.g. /dev/ttyS0)"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"string"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}))),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"slaveId"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"slave id of the device"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}))),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"baudRate"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"baud rate, a measurement of transmission speed"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"19200")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"dataBits"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"data bits (5, 6, 7 or 8)"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"8")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"parity"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"N - None, E - Even, O - Odd (default E) (The use of no parity requires 2 stop bits.)"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"string"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"E")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"stopBits"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"1 or 2"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"1")))),Object(n.b)("h3",{id:"property-visitor"},"Property Visitor"),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Parameter"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Description"),Object(n.b)("th",Object(r.a)({parentName:"tr"},{align:"left"}),"Type"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"register"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"CoilRegister, DiscreteInputRegister, HoldingRegister, or InputRegister"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"string")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"offset"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"Offset indicates the starting register number to read/write data"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int")),Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"quantity"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"Limit number of registers to read/write"),Object(n.b)("td",Object(r.a)({parentName:"tr"},{align:"left"}),"int")))))}l.isMDXComponent=!0},126:function(e,t,a){"use strict";a.d(t,"a",(function(){return p})),a.d(t,"b",(function(){return j}));var r=a(0),n=a.n(r);function b(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){b(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},b=Object.keys(e);for(r=0;r<b.length;r++)a=b[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var b=Object.getOwnPropertySymbols(e);for(r=0;r<b.length;r++)a=b[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=n.a.createContext({}),d=function(e){var t=n.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):i({},t,{},e)),a},p=function(e){var t=d(e.components);return n.a.createElement(l.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.a.createElement(n.a.Fragment,{},t)}},O=Object(r.forwardRef)((function(e,t){var a=e.components,r=e.mdxType,b=e.originalType,c=e.parentName,l=o(e,["components","mdxType","originalType","parentName"]),p=d(a),O=r,j=p["".concat(c,".").concat(O)]||p[O]||s[O]||b;return a?n.a.createElement(j,i({ref:t},l,{components:a})):n.a.createElement(j,i({ref:t},l))}));function j(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var b=a.length,c=new Array(b);c[0]=O;var i={};for(var o in t)hasOwnProperty.call(t,o)&&(i[o]=t[o]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var l=2;l<b;l++)c[l]=a[l];return n.a.createElement.apply(null,c)}return n.a.createElement.apply(null,a)}O.displayName="MDXCreateElement"}}]);