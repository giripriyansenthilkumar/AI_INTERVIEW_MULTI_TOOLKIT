from llama_cpp import Llama

llm = Llama(model_path="path/to/your/ggml-model.bin")

response = llm.create_completion(prompt="Tell me a joke", max_tokens=50)
print(response.choices[0].text)
