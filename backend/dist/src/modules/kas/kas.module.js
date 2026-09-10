"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasModule = void 0;
const common_1 = require("@nestjs/common");
const kas_service_1 = require("./kas.service");
const kas_controller_1 = require("./kas.controller");
let KasModule = class KasModule {
};
exports.KasModule = KasModule;
exports.KasModule = KasModule = __decorate([
    (0, common_1.Module)({
        controllers: [kas_controller_1.KasController],
        providers: [kas_service_1.KasService],
        exports: [kas_service_1.KasService],
    })
], KasModule);
//# sourceMappingURL=kas.module.js.map