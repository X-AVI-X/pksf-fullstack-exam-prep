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

## Processes P1, P2, P3 arrive at time 0 in that order with CPU bursts of 24, 3 and 3 ms. Find the average waiting time under FCFS, SJF and Round Robin (quantum 4), and compare the algorithms.
@concept 8
**FCFS** (first come, first served): P1 0–24, P2 24–27, P3 27–30. Waiting: 0, 24, 27 → average **17 ms**.

**SJF** (shortest job first): P2 0–3, P3 3–6, P1 6–30. Waiting: P2 0, P3 3, P1 6 → average **3 ms**.

**Round Robin, q = 4:** P1 0–4, P2 4–7, P3 7–10, P1 10–30. Waiting = finish − burst: P1 30 − 24 = 6, P2 7 − 3 = 4, P3 10 − 3 = 7 → average 17 / 3 ≈ **5.67 ms**.

| Algorithm | Preemptive | Strength | Weakness |
|---|---|---|---|
| FCFS | no | simple, fair by arrival | convoy effect: short jobs wait behind a long one |
| SJF | no (SRTF is the preemptive form) | minimum average waiting time | needs burst-time estimates; long jobs can starve |
| Round Robin | yes | good response time for interactive systems | context-switch overhead; quantum must be tuned |
| Priority | either | important work first | starvation, fixed by ageing |
+ 2 | FCFS Gantt chart and average 17 | 17
+ 2 | SJF order and average 3 | 3
+ 2 | Round Robin Gantt chart and average 5.67 | 5.67/17/3
+ 2 | Compares the algorithms: convoy effect, starvation, response time | convoy, starvation

## Explain virtual memory, paging and page faults. What is thrashing?
@concept 6
- **Virtual memory** gives each process its own large, contiguous address space that is mapped onto physical RAM and disk. It isolates processes and lets programs be larger than RAM.
- **Paging:** virtual memory is divided into fixed-size **pages** (typically 4 KB) and RAM into **frames**. A per-process **page table** maps page → frame; the **MMU** translates addresses and the **TLB** caches recent translations.
- **Page fault:** the process touches a page that is not in RAM. The OS traps, finds a free frame (or evicts a victim with a replacement algorithm such as **LRU** or Clock, writing it out if it is dirty), loads the page from disk, updates the page table and restarts the instruction.
- **Thrashing:** too little RAM for the active working sets, so the system spends most of its time swapping pages in and out instead of running code; CPU use falls while disk I/O soars. Fixes: add memory, run fewer processes, or tune memory limits (for a JVM, a heap that fits in RAM).
- Paging has no external fragmentation, only a little internal fragmentation in the last page.
+ 1.5 | Virtual memory: per-process address space mapped to RAM and disk | address space
+ 1.5 | Paging: pages, frames, page table (MMU/TLB) | page table, frame
+ 1.5 | Page fault handling and a replacement algorithm | page fault, LRU
+ 1.5 | Thrashing defined, with a fix | thrashing

## Find the error: two threads each call inc() 100,000 times, but the final count is less than 200,000.
@bug 5 verified
~~~java
class Counter {
  private int count;
  public void inc() { count++; }
  public int get() { return count; }
}
~~~
**Bug:** a **race condition**. {{count++}} is not atomic: it reads, adds one and writes. Two threads can read the same value and both write value + 1, so one update is lost (a real run gave 168,714). Making the field {{volatile}} does not fix it, because volatile gives visibility, not atomicity.
**Fixes:**
~~~java
private final AtomicInteger count = new AtomicInteger();
public void inc() { count.incrementAndGet(); }          // lock-free compare-and-swap
// or: public synchronized void inc() { count++; }      // mutual exclusion; get() must be synchronized too
~~~
- The code between read and write is a **critical section**. A **mutex** (lock, {{synchronized}}) admits one thread; a **semaphore** admits up to N. For many writers, {{LongAdder}} scales better.
+ 1.5 | Identifies the race condition / lost update | race/lost update
+ 1.5 | Explains count++ is read-modify-write, not atomic | atomic
+ 1.5 | Correct fix: AtomicInteger or synchronized | AtomicInteger/synchronized
+ 0.5 | Notes volatile is not enough, or defines critical section/mutex | volatile/critical section/mutex

## Compare stack and heap memory in a Java program.
@compare 6
| | Stack | Heap |
|---|---|---|
| Holds | method frames: local variables, parameters, references | all objects and arrays (and their instance fields) |
| Owner | one stack per thread | shared by all threads |
| Lifetime | freed automatically when the method returns | until unreachable, then reclaimed by the garbage collector |
| Speed | very fast (pointer move) | slower allocation, GC cost |
| Size/error | small ({{-Xss}}); deep recursion gives {{StackOverflowError}} | large ({{-Xms}}/{{-Xmx}}); exhaustion gives {{OutOfMemoryError}} |
| Thread safety | inherently thread-confined | shared objects need synchronisation |

- In {{Loan l = new Loan();}} the reference {{l}} lives on the stack and the Loan object on the heap. Static fields and class metadata live in **Metaspace** (off-heap since Java 8).
- A memory leak in Java means objects that stay reachable (for example in a static collection or cache without eviction), so the GC cannot free them.
+ 2 | What each stores: frames/locals vs objects | local, object
+ 1.5 | Per-thread stack vs shared heap; lifetime and GC | thread, garbage/GC
+ 1.5 | StackOverflowError vs OutOfMemoryError and the size flags | StackOverflowError, OutOfMemoryError
+ 1 | Reference-on-stack/object-on-heap example, or Metaspace/leak note | reference/Metaspace/leak
