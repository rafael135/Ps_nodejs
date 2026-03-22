import express from "express";
import { HttpExpressAdapter } from "./../adapters";
import { userController, fileController } from "../controllers/";
import { authMiddleware } from "./middleware/authMiddleware";
import { uploadFileMiddleware } from "./middleware/uploadFileMiddleware";

const routes = express.Router();

//user
routes.post(
  "/user/register",
  HttpExpressAdapter.execute(userController.register.bind(userController))
);
routes.post(
  "/user/login",
  HttpExpressAdapter.execute(userController.login.bind(userController))
);

//files
routes.post(
  "/file/upload",
  authMiddleware.execute,
  uploadFileMiddleware.execute(),
  HttpExpressAdapter.execute(fileController.upload.bind(fileController))
);

routes.get(
  "/files",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.list.bind(fileController))
);

routes.patch(
  "/files/:id/move",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.moveFile.bind(fileController))
);

routes.get(
  "/folders",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.listFolders.bind(fileController))
);

routes.post(
  "/folders",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.createFolder.bind(fileController))
);

routes.patch(
  "/folders/rename",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.renameFolder.bind(fileController))
);

routes.delete(
  "/folders/:name",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.deleteFolder.bind(fileController))
);

export default routes;
