import DiscountService from "./discount.service.js";
import catchAsync from "../../configs/catchAsync.js"




class DiscountController {
    constructor() {
        if (!DiscountController.instance) return DiscountController.instance;
        DiscountController.instance = this;
        this.service = DiscountService;
    }



}


export default new DiscountController()