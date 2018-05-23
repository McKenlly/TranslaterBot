
var restify = require('restify');
var builder = require('botbuilder');
var yandexTranslator = require('yandex.translate');
var data = require('./config.json');

var translator = new yandexTranslator(data.yandexTranslator.token);

var currentLanguage = "en";

var inMemoryStorage = new builder.MemoryBotStorage();
// Возвращает сервер
var server = restify.createServer();

//Поднимает сервер и слушает. Узел разворачивает слушатель listen()
server.listen(3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


// Создает новый экземпляр соединителя чата.
var connector = new builder.ChatConnector({
    appId: data.microsoftBot.id,
    appPassword: data.microsoftBot.password
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);


bot.dialog('/', function(session) {
    translateMessage(session);
});


bot.dialog("/help", [
    function (session) {
        
        var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.list)
        .attachments([
            new builder.HeroCard(session)
                .title('Выберите язык')
                .subtitle('Текст автоматически будет переведен на нужный вам язык')
                .images([
                    builder.CardImage.create(session, 'http://amblog.ru/wp-content/uploads/2016/12/perevod.jpg')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "English", "English"),
                    builder.CardAction.imBack(session, "Russian", "Russian"),
                    builder.CardAction.imBack(session, "German", "German")
            
                ])
            ]);
        builder.Prompts.choice(session, msg, "English|Russian|German");
    },
    function (session, results) {
        // Use the SDK's built-in ability to pick a response at random.
        switch (results.response.index) {
            case 0:
                currentLanguage = "en";
                break;
            case 1:
                currentLanguage = "ru";
                break;
            case 2:
                currentLanguage = "de";
                break;
            default:
                session.endDialog();
                break;
        }
        session.endDialog("Ok, your choice is %s", currentLanguage);
    }
]).triggerAction({
    matches: /^help$/i,
});


var translateMessage =  function(session) {
    translator.translate(session.message.text, currentLanguage)
            .then(function(data) {
                session.send(data);
            })
            .catch(function(e) {
            session.send(e);
        });
}
