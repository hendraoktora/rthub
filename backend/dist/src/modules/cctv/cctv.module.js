"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CctvModule = void 0;
const common_1 = require("@nestjs/common");
const cctv_service_1 = require("./cctv.service");
const cctv_controller_1 = require("./cctv.controller");
let CctvModule = class CctvModule {
};
exports.CctvModule = CctvModule;
exports.CctvModule = CctvModule = __decorate([
    (0, common_1.Module)({
        controllers: [cctv_controller_1.CctvController],
        providers: [cctv_service_1.CctvService],
        exports: [cctv_service_1.CctvService],
    })
], CctvModule);
//# sourceMappingURL=cctv.module.js.map