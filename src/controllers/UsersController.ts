import { Request, Response } from "express";
import { getRepository } from "typeorm";
import * as Yup from "yup";
import Bcrypt from "bcryptjs";

import User from "../models/User";
import orphanages_view from "../views/orphanages_view";
import userView from "../views/users_view";
import OrphanagesController from "./OrphanagesController";

export default {
  async index(request: Request, response: Response) {
    const usersRepository = getRepository(User);
    const users = await usersRepository.find();
    return response.json(userView.renderMany(users));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const usersRepository = getRepository(User);
    const user = await usersRepository.findOneOrFail(Number(id));
    return response.json(userView.render(user));
  },

  async create(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const usersRepository = getRepository(User);

    const data = {
      name,
      email,
      password: await Bcrypt.hash(password, 12),
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const user = usersRepository.create(data);

    await usersRepository.save(user);

    return response.status(201).json(data);
  },
};
