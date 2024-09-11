from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from dotenv import load_dotenv
from openai import AzureOpenAI

app = Flask(__name__)
CORS(app)

load_dotenv()

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-05-01-preview"
)

thread = client.beta.threads.create()

@app.route('/ask', methods=['POST'])
def ask_question():
    question = request.json['question']
    
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=question
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id='asst_6ymOoiZaky8AOyGdQ5Rz3bfp'
    )

    while run.status in ['queued', 'in_progress', 'cancelling']:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )

    if run.status == 'completed':
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        for message in messages.data:
            if message.role == 'assistant':
                # Convert the response to markdown format
                markdown_response = convert_to_markdown(message.content[0].text.value)
                return jsonify({'response': markdown_response})
    else:
        return jsonify({'response': f"Run failed with status: {run.status}"})

def convert_to_markdown(text):
    # This is a placeholder function. You'll need to implement the logic
    # to convert the text to proper markdown format, including formatting
    # for headers, lists, and image links.
    
    # For example, you might want to:
    # - Convert numbered lists to markdown numbered lists
    # - Convert bullet points to markdown bullet points
    # - Wrap image URLs in markdown image syntax
    # - Add appropriate heading levels
    
    # Here's a very basic example:
    lines = text.split('\n')
    markdown_lines = []
    for line in lines:
        if line.startswith('http') and any(ext in line for ext in ['.jpg', '.png', '.gif']):
            markdown_lines.append(f'![image]({line})')
        elif line.startswith('1. ') or line.startswith('2. '):
            markdown_lines.append(line)  # Already in markdown format
        elif line.startswith('- '):
            markdown_lines.append(line)  # Already in markdown format
        else:
            markdown_lines.append(line)
    
    return '\n'.join(markdown_lines)

if __name__ == '__main__':
    app.run(debug=True)