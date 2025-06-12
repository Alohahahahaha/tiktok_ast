/*
@Author: Aloha
@Time: 2025/6/12 11:05
@ProjectName: tiktok_ast
@FileName: ast.py
@Software: PyCharm
*/
const files = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const NodePath = require("@babel/traverse").NodePath;


class TikTok {
    constructor(file_path) {
        this.ast = parser.parse(files.readFileSync(file_path, "utf-8"));
        this.stringPool = {};
        this.transName = [];
        this.varName = null;
        this.mainFunc = null
    }

    save_file() {
        const {code: newCode} = generator(this.ast);
        files.writeFileSync(
            './decode.js',
            newCode,
            "utf-8"
        );
    }

    umq() {
        const wrapIfStatement = (path) => {
            const node = path.node;
            if (!types.isBlockStatement(node.consequent)) {
                node.consequent = types.blockStatement([node.consequent]);
            }

            if (node.alternate) {
                if (types.isIfStatement(node.alternate)) {
                    wrapIfStatement({node: node.alternate});
                } else if (!types.isBlockStatement(node.alternate)) {
                    node.alternate = types.blockStatement([node.alternate]);
                }
            }
        };
        traverse(this.ast, {
            "ForStatement|WhileStatement|ForInStatement|ForOfStatement|DoWhileStatement"(path) {
                if (!types.isBlockStatement(path.node.body)) {
                    path.node.body = types.blockStatement([path.node.body]);
                }
            },
            IfStatement(path) {
                wrapIfStatement(path);
            }
        });
    }

    ldu() {
        let fn, sfn, func, strFunc, initFunc, initFuncName = 'g';
        traverse(this.ast, {
            VariableDeclarator: (path) => {
                let {id, init} = path.node;
                if (!types.isIdentifier(id)) return;
                if (!types.isCallExpression(init)) return;
                if (!types.isMemberExpression(init.callee)) return;
                if (!types.isArrayExpression(init.callee.object)) return;
                let a = eval(generator(init).code);
                let b = id.name;
                this.stringPool[b] = a;
                this.transName.push(b);
                path.remove()
            }
        })
    }

    ymq() {
        traverse(this.ast, {
            MemberExpression: (path) => {
                let {object, property} = path.node;
                if (!types.isIdentifier(object)) return;
                if (!types.isNumericLiteral(property)) return;
                if (!this.transName.includes(object.name)) return;
                let c = this.stringPool[object.name][property.value];
                path.replaceWith(types.stringLiteral(c))
            }
        })
    }

    olw() {
        traverse(this.ast, {
            ConditionalExpression: (path) => {
                let {parentPath, node} = path;
                let {test, consequent, alternate} = node;
                if (types.isExpressionStatement(parentPath)) {
                    if (!types.isExpressionStatement(consequent)) {
                        consequent = types.blockStatement([types.expressionStatement(consequent)]);
                    }
                    if (!types.isExpressionStatement(alternate)) {
                        alternate = types.blockStatement([types.expressionStatement(alternate)]);
                    }
                    parentPath.replaceWith(types.ifStatement(test, consequent, alternate));
                    return;
                }
            }
        });
        traverse(this.ast, {
            SequenceExpression(path) {
                const parent = path.parent;
                if (!types.isExpressionStatement(parent)) return;
                const expressions = path.node.expressions;
                if (expressions.length < 2) return;
                const newStatements = expressions.map(expr => types.expressionStatement(expr));
                path.parentPath.replaceWithMultiple(newStatements);
                path.skip();
            }
        });
    }

    opq(mainFunc, mainSwitchValue) {
        traverse(mainFunc.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isBinaryExpression(test)) return;
                if (test.operator === '===') return;
                if (!types.isIdentifier(test.left)) return;
                if (test.left.name !== mainSwitchValue) return;
                if (!types.isNumericLiteral(test.right)) return;
                let newTest;
                if (test.operator === '<') {
                    newTest = types.binaryExpression('>', types.numericLiteral(test.right.value), types.identifier(test.left.name))
                } else if (test.operator === '>') {
                    newTest = types.binaryExpression('<', types.numericLiteral(test.right.value), types.identifier(test.left.name))
                }
                const statement = types.ifStatement(newTest, consequent, alternate);
                path.replaceWith(statement);
            }
        }, mainFunc.scope)
    }

    qaz(mainFunc, mainSwitchValue, cases) {
        traverse(mainFunc.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isBinaryExpression(test)) return;
                if (!types.isNumericLiteral(test.left)) return;
                if (!types.isIdentifier(test.right) || test.right.name !== mainSwitchValue) return;
                if (path.node.isHandle) return;
                if (test.operator === '===') {
                    if (types.isIfStatement(consequent.body[0])) return;
                    if (alternate === null) {
                        let e = path.parent;
                        if (!types.isIfStatement(e.body[0])) return;
                        let f = path.node.test.left.value;
                        let g = types.binaryExpression('===', types.numericLiteral(f + 1), types.identifier(mainSwitchValue));
                        let h = types.ifStatement(g, types.blockStatement(e.body.slice(1)), null);
                        h.isHandle = true;
                        h.isHandleLine = 244;
                        let i = types.ifStatement(path.node.test, path.node.consequent, types.blockStatement([h]));
                        i.isHandle = true;
                        i.isHandleLine = 247;
                        path.replaceWith(i);
                        cases.push(path);
                        return;
                    }
                    let a = test.left.value;
                    let b = types.binaryExpression('===', types.numericLiteral(a + 1), types.identifier(mainSwitchValue));
                    let c = types.ifStatement(b, types.isIfStatement(alternate) ? types.blockStatement([alternate]) : alternate, null);
                    c.isHandle = true;
                    c.isHandleLine = 256;
                    let d = types.ifStatement(test, consequent, types.blockStatement([c]));
                    d.isHandle = true;
                    d.isHandleLine = 259;
                    path.replaceWith(d);
                    cases.push(path);
                    return;
                }
                if (test.operator !== '===') {
                    if (types.isIfStatement(consequent.body[0])) return;
                    if (path.node.alternate === null) {
                        let p = types.binaryExpression('===', types.numericLiteral(path.node.test.left.value - 1), types.identifier(mainSwitchValue));
                        let q = types.ifStatement(p, path.node.consequent, null);
                        q.isHandle = true;
                        q.isHandleLine = 272;
                        path.replaceWith(q);
                        return;
                    }
                    let j = path.node.test.left.value;
                    let k = types.binaryExpression('===', types.numericLiteral(j - 1), types.identifier(mainSwitchValue));
                    let l = types.binaryExpression('===', types.numericLiteral(j + 1), types.identifier(mainSwitchValue));
                    if (types.isIfStatement(path.node.alternate)) {
                        let r = types.ifStatement(l, types.blockStatement(path.node.alternate.alternate.body), null);
                        r.isHandle = true;
                        r.isHandleLine = 280;
                        let s = types.ifStatement(path.node.alternate.test, path.node.alternate.consequent, types.blockStatement([r]));
                        s.isHandle = true;
                        s.isHandleLine = 283;
                        let t = types.ifStatement(k, path.node.consequent, types.blockStatement([s]));
                        t.isHandle = true;
                        t.isHandleLine = 286;
                        path.replaceWith(t);
                        cases.push(path);
                        return;
                    }
                    let m = types.ifStatement(l, types.blockStatement(path.node.alternate.body[0].alternate.body), null);
                    m.isHandle = true;
                    m.isHandleLine = 293;
                    let n = types.ifStatement(path.node.alternate.body[0].test, path.node.alternate.body[0].consequent, types.blockStatement([m]));
                    n.isHandle = true;
                    n.isHandleLine = 296;
                    let o = types.ifStatement(k, path.node.consequent, types.blockStatement([n]));
                    o.isHandle = true;
                    o.isHandleLine = 299;
                    cases.push(path);
                    path.replaceWith(o)
                }
            },
        }, mainFunc.scope);
    }

    tmw() {
        const cases = [];
        traverse(this.ast, {
            ForStatement: (path) => {
                let {init, test, body} = path.node;
                if (init !== null) return;
                if (test !== null) return;
                const [declStmt, ifStmt] = body.body;
                if (!types.isVariableDeclaration(declStmt)) return;
                if (!types.isIfStatement(ifStmt)) return;
                this.varName = body.body[0].declarations[0].id.name;
                this.mainFunc = path.getFunctionParent();
                this.opq(this.mainFunc, this.varName);
                this.qaz(this.mainFunc, this.varName, cases);

                if (cases.length <= 2) return;
                const case_switch = [];
                cases.forEach(statement => {
                    let {test, consequent, alternate} = statement.node;
                    if (alternate === null) {
                        consequent.body.push(types.breakStatement());
                        let d = types.switchCase(types.numericLiteral(test.left.value), consequent.body);
                        case_switch.push(d);
                        return
                    }
                    consequent.body.push(types.breakStatement());
                    let a = types.switchCase(types.numericLiteral(test.left.value), consequent.body);
                    case_switch.push(a);
                    alternate.body[0].consequent.body.push(types.breakStatement());
                    let b = types.switchCase(types.numericLiteral(alternate.body[0].test.left.value), alternate.body[0].consequent.body);
                    case_switch.push(b);
                    if (alternate.body[0].alternate !== null) {
                        alternate.body[0].alternate.body[0].consequent.body.push(types.breakStatement());
                        let c = types.switchCase(types.numericLiteral(alternate.body[0].alternate.body[0].test.left.value), alternate.body[0].alternate.body[0].consequent.body);
                        case_switch.push(c)
                    }
                });
                const switchNode = types.switchStatement(types.identifier(this.varName), case_switch);

                body.body = [declStmt, switchNode];
            }
        });

    }

    start() {
        this.umq();
        this.ldu();
        this.ymq();
        this.olw();
        this.tmw();
        this.save_file();
    }

}

console.time('处理完毕，耗时');

let tk_ast = new TikTok('./fullcode.js');
tk_ast.start();


console.timeEnd('处理完毕，耗时');

