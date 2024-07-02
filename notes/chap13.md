# System Recovery

## Failure Classification

• Transaction failure (事务故障)
– Logical errors, e.g., illegal inputs
– System errors, e.g., dead locks
• System crash (系统崩溃)
– A power failure, or other hardware and software failure causes the system to crash
• Disk failure (磁盘故障)
– A head crash or similar disk failure destroys all or part of disk storage

### Recovery Algorithms

* Techniques to ensure database consistency and transaction atomicity despite failures

* Recovery algorithms have two parts
  * Actions taken during normal transaction processing 
    * 保证有足够的信息用于故障恢复
  * Actions taken after a failure
    * 恢复数据库到某个一致性状态

## Storage

## Recovery and Atomicity

