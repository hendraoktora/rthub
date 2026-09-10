"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagihanModule = void 0;
const common_1 = require("@nestjs/common");
const tagihan_service_1 = require("./tagihan.service");
const tagihan_controller_1 = require("./tagihan.controller");
let TagihanModule = class TagihanModule {
};
exports.TagihanModule = TagihanModule;
exports.TagihanModule = TagihanModule = __decorate([
    (0, common_1.Module)({
        controllers: [tagihan_controller_1.TagihanController],
        providers: [tagihan_service_1.TagihanService],
        exports: [tagihan_service_1.TagihanService],
    })
], TagihanModule);
//# sourceMappingURL=tagihan.module.js.map