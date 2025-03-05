"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesModule = void 0;
const common_1 = require("@nestjs/common");
const deliveries_service_1 = require("./deliveries.service");
const deliveries_controller_1 = require("./deliveries.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const delivery_fee_module_1 = require("../delivery-fee/delivery-fee.module");
let DeliveriesModule = class DeliveriesModule {
};
exports.DeliveriesModule = DeliveriesModule;
exports.DeliveriesModule = DeliveriesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, delivery_fee_module_1.DeliveryFeeModule],
        controllers: [deliveries_controller_1.DeliveriesController],
        providers: [deliveries_service_1.DeliveriesService],
        exports: [deliveries_service_1.DeliveriesService]
    })
], DeliveriesModule);
//# sourceMappingURL=deliveries.module.js.map