const { Base, Collection, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

/**
 * コマンドフォルダ内のすべてのコマンドデータを取得する
 * @param {string | object} obj コマンドフォルダのパス、またはコマンドデータ
 * @returns {object[]} コマンドデータの配列
 */
function getCommandDatas(obj) {
    if (typeof obj !== 'string') return obj;
    const commandFiles = fs.readdirSync(obj).filter(file => file.endsWith('.js'));
    return commandFiles.map(commandFile => require(path.resolve(obj, commandFile)));
}

class Subcommand {
    /**
     * @param {object} data サブコマンドのデータ
     * @param {Command | SubcommandGroup} parent 親コマンド
     * @param {typeof SlashCommandSubcommandBuilder} builderClass ビルダーのクラス
     */
    constructor(data, parent, builderClass = SlashCommandSubcommandBuilder) {
        this.builder = data.builder;
        this.parent = parent;
        this.execute = async (...parentArgs) => {
            let args = parentArgs;
            if (this.parent.execute instanceof Function) {
                args = await this.parent.execute(...args);
            }
            if (data.execute instanceof Function) {
                args = await data.execute(...args);
            }
            return args;
        };
        this._builderClass = builderClass;
        this.build();
        this.category = parent.category;
        this.logger = parent.logger.createChild(this.name);
        this.autoComplete = data.autoComplete;
    }

    build(builderInstance = this._builderClass) {
        const builder = this.builder(new builderInstance());
        this.name = builder.name;
        this.description = builder.description;
        this.options = builder.options;
        return builder.toJSON();
    }
}

class SubcommandGroup extends Subcommand {
    /**
     * @param {object} data サブコマンドグループのデータ
     * @param {Command} parent 親コマンド
     */
    constructor(data, parent) {
        super(data, parent, SlashCommandSubcommandGroupBuilder);
        this.subcommands = new Collection();
        getCommandDatas(data.subcommands).forEach(subcommandData => {
            const subcommand = new Subcommand(subcommandData, this);
            this.subcommands.set(subcommand.name, subcommand);
        });
        this.builder = (builder) => {
            data.builder(builder);
            this.subcommands.forEach(subcommandData => {
                builder.addSubcommand(subcommandData.builder);
            });
            return builder;
        };
    }
}

class Command extends Base {
    /**
     * @param {import('discord.js').Client} client Discordクライアント
     * @param {object} data コマンドデータ
     * @param {import('winston').Logger} Log ロガーインスタンス
     */
    constructor(client, data, Log) {
        super(client);
        this.logger = Log.createChild(data.builder(new SlashCommandBuilder()).name);

        if ('subcommandGroups' in data) {
            this.subcommandGroups = new Collection();
            getCommandDatas(data.subcommandGroups).forEach(subcommandGroupData => {
                const subcommandGroup = new SubcommandGroup(subcommandGroupData, this);
                this.subcommandGroups.set(subcommandGroup.name, subcommandGroup);
            });
        }
        if ('subcommands' in data) {
            this.subcommands = new Collection();
            getCommandDatas(data.subcommands).forEach(subcommandData => {
                const subcommand = new Subcommand(subcommandData, this);
                this.subcommands.set(subcommand.name, subcommand);
            });
        }

        if (this.subcommandGroups?.size || this.subcommands?.size) {
            this.builder = (builder) => {
                data.builder(builder);
                this.subcommandGroups?.forEach(subcommandGroupData => {
                    builder.addSubcommandGroup(subcommandGroupData.builder);
                });
                this.subcommands?.forEach(subcommandData => {
                    builder.addSubcommand(subcommandData.builder);
                });
                return builder;
            };
        } else {
            this.builder = data.builder;
        }

        this.build();
        this.category = data.category;
        this.execute = data.execute;
        this.autocomplete = data.autocomplete;
    }

    build(builderInstance = SlashCommandBuilder) {
        const builder = this.builder(new builderInstance());
        this.name = builder.name;
        this.description = builder.description;
        this.options = builder.options;
        this.dm_permission = builder.dm_permission; // 修正: DMPermission → dm_permission
        return builder.toJSON();
    }
}

/**
 * コマンドをロードする関数
 * @param {import('discord.js').Client} client Discordクライアント
 * @param {string} commandsPath コマンドの格納フォルダのパス
 * @returns {Collection<string, Command>} 読み込まれたコマンドのコレクション
 */
function CommandsBuilder(client, commandsPath) {
    const Log = client.logger.createChannel('command');
    Log.info('Loading...');
    const commands = new Collection();

    fs.readdirSync(commandsPath).forEach((categoryDir) => {
        Log.debug(`Loading category ${categoryDir}...`);
        const categoryPath = path.resolve(commandsPath, categoryDir);
        const categoryLog = Log.createChild(categoryDir);
        const commandDatas = getCommandDatas(categoryPath);

        for (const commandData of commandDatas) {
            commandData.category = categoryDir;
            const command = new Command(client, commandData, categoryLog);
            commands.set(command.name, command);
            Log.debug(`Loaded command ${command.category} ${command.name}`);
        }

        Log.debug(`Loaded category ${categoryDir} ${commands.size} commands`);
    });

    Log.info(`Loaded ${commands.size} commands`);
    return commands;
}

module.exports = CommandsBuilder;
