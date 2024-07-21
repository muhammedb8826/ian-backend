import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserMachineService } from './user-machine.service';


@Controller('user-machine')
export class UserMachineController {
    constructor(private readonly userMachineService: UserMachineService) {}
    @Post()
    assignMachineToUser(@Body() assignMachineDto: { userId: string, machineId: string[]}) {
        return this.userMachineService.assignMachineToUser(assignMachineDto.userId, assignMachineDto.machineId);
      }

      @Get()
      findAll() {
        return this.userMachineService.getUserMachines();
      }

      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.userMachineService.getUserMachineById(id);
      }

      @Put(':id')
      update(@Param('id') id: string, @Body() updateMachineDto: { machineId: string[] }) {
        return this.userMachineService.updateUserMachine(id, updateMachineDto.machineId);
      }

      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.userMachineService.deleteUserMachine(id);
      }
}
