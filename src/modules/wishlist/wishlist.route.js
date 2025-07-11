import express from 'express';
import WishListController from './wishlist.controller';
const router = express.Router();

router.post('/create', WishListController.createWishList);
router.put('/update/:id', WishListController.updateWishList);
router.delete('/detele/:id', WishListController.deleteItem);
router.post('/clear', WishListController.clearWishList);
router.get('/get', WishListController.getWishListById);

export default router;
