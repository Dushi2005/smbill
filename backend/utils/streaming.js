export async function pipeStreamToClient(stream, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  try {
    for await (const chunk of stream) {
      res.write(`data: ${chunk.text}\n\n`);
    }
    res.write("event: done\ndata: END\n\n");
    res.end();
  } catch (err) {
    res.write("event: error\ndata: Streaming failed\n\n");
    res.end();
  }
}
