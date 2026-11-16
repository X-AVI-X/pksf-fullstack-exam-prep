## Explain deadlock and how to prevent it in a Java/DB application.
- **Deadlock:** two or more threads or transactions each hold a resource the other needs, so none can proceed.
- **Four conditions** (all must hold): mutual exclusion, hold and wait, no preemption, circular wait.
- **Prevention in Java:** acquire locks in a global fixed order, use {{tryLock(timeout)}}, keep critical sections small, prefer java.util.concurrent structures.
- **In the DB:** update rows in a consistent order (for example by id), keep transactions short, use appropriate isolation, and retry on deadlock errors (PostgreSQL 40P01).
+ 1.5 | Definition | deadlock
+ 1.5 | Four Coffman conditions | circular wait
+ 1.5 | Java prevention: lock ordering, tryLock | tryLock/order
+ 1.5 | DB prevention: consistent order, short transactions, retry | retry

## Compare process and thread, and explain what a context switch costs.
@compare 6
| | Process | Thread |
|---|---|---|
| Memory | own address space | shares the process's heap and code; own stack |
| Creation | heavy (fork) | light |
| Communication | IPC (pipes, sockets, shared memory) | shared variables (needs synchronization) |
| Isolation | crash is isolated | one thread can crash the whole process |
| Context switch | costly: page tables and TLB flush | cheaper: registers and stack only |

A **context switch** saves the CPU state (registers, program counter) of one task to its PCB/TCB and loads another's. Process switches also change address space, which invalidates TLB and cache warmth. Java 21 **virtual threads** reduce this cost for I/O-bound work.
+ 2 | Memory sharing difference | address space/share
+ 1 | Creation cost and communication | IPC
+ 1 | Isolation and fault impact | crash/isolat
+ 2 | Context switch explained with its cost | context switch, TLB/register
