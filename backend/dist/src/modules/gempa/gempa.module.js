"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GempaModule = void 0;
const common_1 = require("@nestjs/common");
const gempa_service_1 = require("./gempa.service");
const gempa_controller_1 = require("./gempa.controller");
let GempaModule = class GempaModule {
};
exports.GempaModule = GempaModule;
exports.GempaModule = GempaModule = __decorate([
    (0, common_1.Module)({
        controllers: [gempa_controller_1.GempaController],
        providers: [gempa_service_1.GempaService],
        exports: [gempa_service_1.GempaService],
    })
], GempaModule);
//# sourceMappingURL=gempa.module.js.map