from langchain_community.llms import Ollama
from langchain import PromptTemplate, LLMChain
from langchain.memory import ConversationBufferMemory

# Initialize the Ollama model
llm = Ollama(model="gemma2:2b")

# Create the chatbot using LangChain and Conversation Memory
def run_terminal_chatbot():
    # Set up memory for context retention
    memory = ConversationBufferMemory()

    # Set up a template for the chat
    # template = "The following is a conversation between a user and an AI assistant:\n\n{history}\nUser: {input}\nAI:"
    template = "You are a rude and sarcastic AI assistant The following is a conversation between a user and an AI assistant:\n\n{history}\nUser: {input}\nAI:"
    prompt = PromptTemplate(input_variables=["history", "input"], template=template)

    # Create the LLM Chain with memory
    llm_chain = LLMChain(
        llm=llm,
        prompt=prompt,
        memory=memory,
        verbose=True
    )

    print("Chatbot: Hello! How can I help you?")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ['exit', 'quit']:
            print("Chatbot: Goodbye!")
            break

        # Generate response using LLM Chain with memory
        response = llm_chain.run(user_input)
        print(f"Chatbot: {response}")

if __name__ == "__main__":
    run_terminal_chatbot()
