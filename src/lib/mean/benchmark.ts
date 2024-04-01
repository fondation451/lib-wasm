import { writeFileSync } from "fs";
import lodash from "lodash";
import { markdownTable } from "markdown-table";
import { Bench } from "tinybench";
import { mean, meanJs, meanWasm } from "./mean";

type Benchmark<DataT> = {
  runners: Array<{ name: string; f: (data: DataT) => void }>;
  generator: (size: number) => DataT;
  sizes: number[];
};

async function runBenchmark<DataT>(benchmark: Benchmark<DataT>): Promise<{ opsSec: string; averageTime: string }> {
  const bench = new Bench({ time: 100 });

  benchmark.sizes.forEach((size) => {
    const data = benchmark.generator(size);
    benchmark.runners.forEach((runner) => {
      bench.add(`${runner.name}|${size}`, () => {
        runner.f(data);
      });
    });
  });

  await bench.warmup();
  await bench.run();

  const benchTable = bench.table();

  const tableOpsSec = [["Size", ...benchmark.runners.map(({ name }) => name)]] as string[][];
  const tableAverageTime = [["Size", ...benchmark.runners.map(({ name }) => name)]] as string[][];

  benchmark.sizes.forEach((size) => {
    const lineOpsSec = [size.toString()];
    const lineAverageTime = [size.toString()];

    benchmark.runners.forEach(({ name }) => {
      const value = benchTable.find((value) => value?.["Task Name"] === `${name}|${size}`);
      const opsSec = value?.["ops/sec"] || "";
      const averageTime = value?.["Average Time (ns)"].toString() || "";
      lineOpsSec.push(opsSec);
      lineAverageTime.push(averageTime);
    });

    tableOpsSec.push(lineOpsSec);
    tableAverageTime.push(lineAverageTime);
  });

  return { opsSec: markdownTable(tableOpsSec), averageTime: markdownTable(tableAverageTime) };
}

(async () => {
  const { opsSec, averageTime } = await runBenchmark({
    runners: [
      { name: "mean", f: (data: number[]) => mean(data) },
      { name: "meanJs", f: (data: number[]) => meanJs(data) },
      { name: "meanWasm", f: (data: number[]) => meanWasm(data) },
      { name: "lodash.mean", f: (data: number[]) => lodash.mean(data) },
    ],
    generator: (n: number): number[] => {
      const MAX_INT = 100;
      const arr: number[] = [];

      for (let i = 0; i < n; i++) {
        arr.push(Math.floor(Math.random() * MAX_INT));
      }

      return arr;
    },
    sizes: Array(15)
      .fill(0)
      .map((_, i) => 2 ** i),
  });

  writeFileSync(
    `./BENCHMARK.md`,
    `## Benchmark

### Ops per sec

${opsSec}

### Average time (in ns)

${averageTime}
`,
    { flag: "w+" },
  );
})();
