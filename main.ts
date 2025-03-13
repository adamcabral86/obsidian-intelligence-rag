/**
 * Intelligence RAG Assistant Plugin for Obsidian
 * 
 * This plugin integrates Retrieval-Augmented Generation (RAG) with Ollama to enhance
 * intelligence analysis of notes within Obsidian. It allows users to semantically
 * search their notes, extract metadata, and discover connections between documents.
 * 
 * @author Adam Cabral
 * @version 0.1.0
 */

import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { OllamaService } from './src/ai/ollama';

/**
 * Interface defining the settings for the Intelligence RAG plugin
 * 
 * @interface IntelligenceRagSettings
 * @property {string} ollamaHost - URL to the Ollama API server
 * @property {string} embeddingModel - Model to use for generating embeddings
 * @property {string} chatModel - Model to use for chat and metadata generation
 * @property {number} processingBatchSize - Number of notes to process in one batch
 * @property {boolean} autoProcessNewNotes - Whether to automatically process new notes
 */
interface IntelligenceRagSettings {
	ollamaHost: string;
	embeddingModel: string;
	chatModel: string;
	processingBatchSize: number;
	autoProcessNewNotes: boolean;
}

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: IntelligenceRagSettings = {
	ollamaHost: 'http://localhost:11434',
	embeddingModel: 'all-minilm:latest',
	chatModel: 'llama3.2:latest',
	processingBatchSize: 5,
	autoProcessNewNotes: true
}

/**
 * Main plugin class for the Intelligence RAG Assistant
 * 
 * This class is responsible for initializing the plugin, registering commands
 * and UI components, and managing the overall lifecycle of the plugin.
 * 
 * @class IntelligenceRagPlugin
 * @extends Plugin
 */
export default class IntelligenceRagPlugin extends Plugin {
	/** Plugin settings */
	settings: IntelligenceRagSettings;
	/** Service for connecting to and interacting with Ollama */
	ollamaService: OllamaService;
	/** Status bar item for displaying connection status */
	statusBarItem: HTMLElement;

	/**
	 * Lifecycle method called when the plugin is loaded
	 * Sets up the plugin, loads settings, initializes services, and registers UI components
	 */
	async onload() {
		await this.loadSettings();
		
		// Initialize Ollama service
		this.ollamaService = new OllamaService(this.settings.ollamaHost);
		// Give the service a moment to connect after startup
		setTimeout(() => this.initializeOllamaConnection(), 2000);

		// Add settings tab
		this.addSettingTab(new IntelligenceRagSettingTab(this.app, this));

		// Register ribbon icon to open the RAG interface
		this.addRibbonIcon('search', 'Intelligence RAG Assistant', () => {
			// TODO: Open the RAG sidebar interface
			console.log('RAG Assistant clicked');
		});

		// Register command to open the RAG interface
		this.addCommand({
			id: 'open-intelligence-rag',
			name: 'Open Intelligence RAG Assistant',
			callback: () => {
				// TODO: Open the RAG sidebar interface
				console.log('RAG Assistant command triggered');
			}
		});

		// Add status bar item to show connection status
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.setText('RAG: Ready');

		console.log('Intelligence RAG plugin loaded');
	}

	/**
	 * Attempts to establish a connection to the Ollama instance
	 * Updates the status bar with the connection status
	 */
	async initializeOllamaConnection() {
		try {
			const isConnected = await this.ollamaService.checkConnection();
			
			if (isConnected) {
				console.log('Successfully connected to Ollama');
				this.statusBarItem?.setText('RAG: Connected');
			} else {
				console.error('Failed to connect to Ollama');
				this.statusBarItem?.setText('RAG: Connection Error');
			}
		} catch (error) {
			console.error('Error connecting to Ollama:', error);
			this.statusBarItem?.setText('RAG: Connection Error');
		}
	}

	/**
	 * Lifecycle method called when the plugin is unloaded
	 * Cleans up resources and prepares for plugin deactivation
	 */
	onunload() {
		console.log('Intelligence RAG plugin unloaded');
	}

	/**
	 * Loads the plugin settings from Obsidian's data store
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Saves the plugin settings to Obsidian's data store
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/**
 * Settings tab class for the Intelligence RAG plugin
 * 
 * This class is responsible for rendering the settings UI and handling
 * user interactions with the settings.
 * 
 * @class IntelligenceRagSettingTab
 * @extends PluginSettingTab
 */
class IntelligenceRagSettingTab extends PluginSettingTab {
	/** Reference to the parent plugin */
	plugin: IntelligenceRagPlugin;

	/**
	 * Creates a new instance of the settings tab
	 * 
	 * @param app - The Obsidian app instance
	 * @param plugin - The parent plugin instance
	 */
	constructor(app: App, plugin: IntelligenceRagPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Renders the settings UI
	 * This method is called when the settings tab is opened
	 */
	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Intelligence RAG Assistant Settings'});

		// Ollama host URL setting
		new Setting(containerEl)
			.setName('Ollama Host')
			.setDesc('The URL of your Ollama instance')
			.addText(text => text
				.setPlaceholder('http://localhost:11434')
				.setValue(this.plugin.settings.ollamaHost)
				.onChange(async (value) => {
					this.plugin.settings.ollamaHost = value;
					await this.plugin.saveSettings();
					this.plugin.ollamaService.setHost(value);
					this.plugin.initializeOllamaConnection();
				}));

		// Embedding model setting
		new Setting(containerEl)
			.setName('Embedding Model')
			.setDesc('The Ollama model to use for generating embeddings')
			.addText(text => text
				.setPlaceholder('all-minilm:latest')
				.setValue(this.plugin.settings.embeddingModel)
				.onChange(async (value) => {
					this.plugin.settings.embeddingModel = value;
					await this.plugin.saveSettings();
				}));

		// Chat model setting
		new Setting(containerEl)
			.setName('Chat Model')
			.setDesc('The Ollama model to use for RAG and metadata generation')
			.addText(text => text
				.setPlaceholder('llama3.2:latest')
				.setValue(this.plugin.settings.chatModel)
				.onChange(async (value) => {
					this.plugin.settings.chatModel = value;
					await this.plugin.saveSettings();
				}));

		// Batch size setting for performance control
		new Setting(containerEl)
			.setName('Processing Batch Size')
			.setDesc('Number of notes to process in one batch (higher values may impact performance)')
			.addSlider(slider => slider
				.setLimits(1, 20, 1)
				.setValue(this.plugin.settings.processingBatchSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.processingBatchSize = value;
					await this.plugin.saveSettings();
				}));

		// Auto-processing toggle
		new Setting(containerEl)
			.setName('Auto-Process New Notes')
			.setDesc('Automatically process new notes when they are created or modified')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoProcessNewNotes)
				.onChange(async (value) => {
					this.plugin.settings.autoProcessNewNotes = value;
					await this.plugin.saveSettings();
				}));

		// Connection test button
		new Setting(containerEl)
			.setName('Test Ollama Connection')
			.setDesc('Test the connection to your Ollama instance')
			.addButton(button => button
				.setButtonText('Test Connection')
				.onClick(async () => {
					button.setButtonText('Testing...');
					button.setDisabled(true);
					
					try {
						const isConnected = await this.plugin.ollamaService.checkConnection();
						if (isConnected) {
							new Notice('Successfully connected to Ollama');
							button.setButtonText('Connection Successful');
						} else {
							new Notice('Failed to connect to Ollama', 5000);
							button.setButtonText('Connection Failed');
						}
					} catch (error) {
						console.error('Error testing connection:', error);
						new Notice(`Error: ${error.message}`, 5000);
						button.setButtonText('Connection Error');
					} finally {
						setTimeout(() => {
							button.setButtonText('Test Connection');
							button.setDisabled(false);
						}, 3000);
					}
				}));
	}
}