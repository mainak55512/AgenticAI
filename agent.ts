import { ChatGroq } from "@langchain/groq"
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { HumanMessage, AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, Annotation } from "@langchain/langgraph";
import * as rl from "readline-sync";
import { GROQ_API_KEY } from "./api_keys";

process.env.GROQ_API_KEY = GROQ_API_KEY

// LLM Model Specs
const model: ChatGroq = new ChatGroq({
	model: "Gemma2-9b-It",
	temperature: 0,
});

// Creating agent state to hold data
const AgentState = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (x, y) => x.concat(y),
	}),
	sender: Annotation<string>({
		reducer: (x, y) => y ?? x ?? "user",
		default: () => "user",
	}),
});

// Agent Creation Outline
async function createAgent({
	llm,
	systemMessage,
}: {
	llm: ChatGroq;
	systemMessage: string;
}): Promise<Runnable> {
	let prompt = ChatPromptTemplate.fromMessages([
		[
			"system",
			"{system_message}"
		],
		new MessagesPlaceholder("messages"),
	]);
	prompt = await prompt.partial({
		system_message: systemMessage,
	});

	return prompt.pipe(llm);
}

// Agent Node Runner
async function runAgentNode(props: {
	state: typeof AgentState.State;
	agent: Runnable;
	name: string;
}) {
	const { state, agent, name } = props;
	let result = await agent.invoke(state);
	result = new HumanMessage({ ...result, name: name });
	return {
		messages: [result],
		sender: name,
	};
}

const keywordGeneratorAgent = await createAgent({
	llm: model,
	systemMessage: "provide comma separated keywords from the following statement: "
});

async function generateKeywordNode(state: typeof AgentState.State) {
	return runAgentNode({
		state: state,
		agent: keywordGeneratorAgent,
		name: "KeyGen"
	})
}

const statementGeneratorAgent = await createAgent({
	llm: model,
	systemMessage: "Make sentence with each and every keyword separately and return the sentences in numbered way"
})

async function statementGeneratorNode(state: typeof AgentState.State) {
	return runAgentNode({
		state: state,
		agent: statementGeneratorAgent,
		name: "STGen"
	})
}

// Define a new graph
const workflow: any = new StateGraph(MessagesAnnotation)
	.addNode("KeyGen", generateKeywordNode)
	.addNode("STGen", statementGeneratorNode)
	.addEdge("__start__", "KeyGen")
	.addEdge("KeyGen", "STGen")
	.addEdge("STGen", "__end__")

// Finally, we compile it into a LangChain Runnable.
const app: any = workflow.compile();

while (true) {
	let ans = rl.question("User: ");

	if (ans === "exit" || ans === "quit" || ans === "q") {
		break;
	} else {
		const finalState: any = await app.invoke({
			messages: [new HumanMessage(ans)],
		});
		console.log("Agent: ", finalState.messages[finalState.messages.length - 1].content);
	}
}
