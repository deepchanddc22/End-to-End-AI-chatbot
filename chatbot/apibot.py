from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain import PromptTemplate, LLMChain
from langchain.memory import ConversationBufferMemory
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # Adjust this to your frontend's URL if different
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Ollama model
llm = Ollama(model="gemma2:2b")

# Set up memory for context retention
memory = ConversationBufferMemory()

# Set up a template for the chat
template = "You are a rude and insulting AI assistant. The following is a conversation between a user and an AI assistant:\n\n{history}\nUser: {input}\nAI:"
prompt = PromptTemplate(input_variables=["history", "input"], template=template)

# Create the LLM Chain with memory
llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    memory=memory,
    verbose=True
)

# Define the request body structure
class UserInput(BaseModel):
    message: str

# Variable to track the chat status
chat_active = True

# FastAPI POST endpoint to handle user input and generate chatbot response
@app.post("/chat/")
async def chat(input: UserInput):
    global chat_active
    
    if not chat_active:
        raise HTTPException(status_code=400, detail="The chat session has ended. Please start a new session.")
    print(f"Received input: {input}")
    try:
        user_input = input.message
        
        # Generate response using LLM Chain with memory
        response = llm_chain.run(user_input)
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FastAPI POST endpoint to end the chat session
@app.post("/endchat/")
async def end_chat():
    global chat_active
    chat_active = False
    return {"response": "Chat session has ended. You can start a new session by sending a message to /chat."}

# Run the FastAPI app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
