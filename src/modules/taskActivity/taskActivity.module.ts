import { Module } from "@nestjs/common";
import { taskActivityController } from "./taskActivity.controller";
import { TaskActivityService } from "./taskActivity.service";

@Module({
    imports: [],
    controllers: [taskActivityController],
    providers: [TaskActivityService],
})
export class TaskActivityModule { }