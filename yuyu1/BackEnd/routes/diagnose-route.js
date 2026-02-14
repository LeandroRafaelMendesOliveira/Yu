// diagnose-routes.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico Completo das Rotas...\n');

// Lista de todas as rotas para verificar
const routesToCheck = [
    './routes/deckRoutes.js',
    './routes/userRoutes.js', 
    './routes/populateRoutes.js',
    './routes/cardRoutes.js',
    './routes/animationRoutes.js'
];

function checkRouteFile(routePath) {
    const fullPath = path.resolve(__dirname, routePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ Arquivo não existe: ${routePath}`);
        return false;
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Verificar se o arquivo está vazio
        if (content.trim().length === 0) {
            console.log(`❌ Arquivo vazio: ${routePath}`);
            return false;
        }

        // Verificar exportação
        if (!content.includes('module.exports')) {
            console.log(`❌ Não exporta router: ${routePath}`);
            return false;
        }

        // Verificar se usa express.Router
        if (!content.includes('express.Router') && !content.includes('express().Router')) {
            console.log(`❌ Não cria router: ${routePath}`);
            return false;
        }

        console.log(`✅ Arquivo OK: ${routePath}`);
        return true;

    } catch (error) {
        console.log(`❌ Erro ao verificar ${routePath}: ${error.message}`);
        return false;
    }
}

console.log('📁 Verificando arquivos de rotas...');
const validRoutes = [];
routesToCheck.forEach(routePath => {
    if (checkRouteFile(routePath)) {
        validRoutes.push(routePath);
    }
});

console.log('\n🔧 Testando importações...');
validRoutes.forEach(routePath => {
    try {
        const routeModule = require(routePath);
        
        if (!routeModule) {
            console.log(`❌ Importação retorna undefined: ${routePath}`);
            return;
        }

        // Verificar se é uma função de middleware do Express
        if (typeof routeModule === 'function' && 
            (routeModule.name === 'router' || routeModule.stack)) {
            console.log(`✅ Router válido: ${routePath}`);
        } else if (typeof routeModule === 'object' && routeModule.stack) {
            console.log(`✅ Router válido (objeto): ${routePath}`);
        } else {
            console.log(`❌ Não é um router válido: ${routePath}`);
            console.log(`   Tipo: ${typeof routeModule}`);
        }

    } catch (error) {
        console.log(`❌ Erro ao importar ${routePath}: ${error.message}`);
    }
});

console.log('\n💡 Recomendações:');
if (validRoutes.length === 0) {
    console.log('1. Crie os arquivos de rotas faltantes');
} else {
    console.log('1. Verifique se todas as rotas exportam corretamente');
}
console.log('2. Use app.use() apenas com routers válidos');
console.log('3. Verifique se não há loops de importação');