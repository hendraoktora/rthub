"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WilayahModule = void 0;
const common_1 = require("@nestjs/common");
const wilayah_service_1 = require("./wilayah.service");
const wilayah_controller_1 = require("./wilayah.controller");
let WilayahModule = class WilayahModule {
};
exports.WilayahModule = WilayahModule;
exports.WilayahModule = WilayahModule = __decorate([
    (0, common_1.Module)({
        controllers: [wilayah_controller_1.WilayahController],
        providers: [wilayah_service_1.WilayahService],
        exports: [wilayah_service_1.WilayahService],
    })
], WilayahModule);
//# sourceMappingURL=wilayah.module.js.map