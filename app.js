import mongoose from "mongoose";
import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import Task from "./models/Task.js";

dotenv.config();
const app = express();

const corsOptions = {
  origin: ["http://127.0.0.1:3000", "https://my-todo.com"], //주소 수정
};

app.use(cors()); // cors허용

// json 문자열 -> js 객체 === 파싱 passing
app.use(express.json());
// 앱 전체에서 이걸 사용하겠다 - 파싱해주는놈임

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.name === "ValidationError") {
        res.status(400).send({ message: e.message });
      } else if (e.name === "CastError" || e.name === "NotFound") {
        res.status(404).send({ message: "Cannot find given id" });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

// tasks request 가 들어오면 콜백 함수를 실행해라
// 리퀘스트 핸들러
app.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOption = { createdAt: sort === "oldest" ? "asc" : "desc" };

    const tasks = await Task.find().sort(sortOption).limit(count);

    res.send(tasks);
  })
);

app.get(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id);

    if (task) {
      res.send(task);
    } else {
      res.status(404).send({ message: "Cannot find give id. " });
    }
  })
);

app.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);
    // const ids = mockTasks.map((task) => task.id);
    // newTask.id = Math.max(...ids) + 1;
    // newTask.isComplete = false;
    // newTask.createdAt = new Date();
    // newTask.updatedAt = new Date();
    // 데이터베이스를 사용하면 쉬워질거임 일단 이렇게

    res.status(201).send(newTask);
  })
);

app.patch(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
      Object.keys(req.body).forEach((key) => {
        task[key] = req.body[key];
      });
      await task.save();
      res.send(task);
    } else {
      res.status(404).send({ message: "Cannot find give id. " });
    }
  })
);

app.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "Cannot find give id. " });
    }
  })
);

app.listen(process.env.PORT, () => console.log("Server Started"));
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));
// 3000 = 포트번호 / 어플리케이션이 실행되면 콜백함수 실행

/**
 * import express from 'express';
 *
 * const app = express();
 *
 * 라우트 정의
 * app.method(path, handler)
 *
 * path: 엔드포인트 경로
 * handler: 리퀘스트 로직을 처리하고 리스폰스를 돌려주는 핸들러 함수. 첫 번째 파라미터로 리퀘스트 객체, 두 번째 파라미터로 리스폰스 객체를 받습니다
 *
 * app.listen(3000, () => console.log('Server Started'));
 *
 * method: HTTP 메소드 이름
 *
 *
 */
