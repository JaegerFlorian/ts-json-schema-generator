import * as ts from "typescript";
import { Context } from "./NodeParser";
import { SubNodeParser } from "./SubNodeParser";
import { BaseType } from "./Type/BaseType";
import { DefinitionType } from "./Type/DefinitionType";

export class ExposeNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private subNodeParser: SubNodeParser,
    ) {
    }

    public supportsNode(node: ts.Node): boolean {
        return this.subNodeParser.supportsNode(node);
    }
    public createType(node: ts.Node, context: Context): BaseType {
        const baseType: BaseType = this.subNodeParser.createType(node, context);
        if (!this.isExportNode(node)) {
            return baseType;
        }

        return new DefinitionType(
            this.getDefinitionName(node, context),
            baseType,
        );
    }

    private isExportNode(node: ts.Node): boolean {
        const localSymbol: ts.Symbol = (node as any).localSymbol;
        return localSymbol ? (localSymbol.flags & ts.SymbolFlags.ExportType) !== 0 : false;
    }
    private getDefinitionName(node: ts.Node, context: Context): string {
        const fullName: string = this.typeChecker.getFullyQualifiedName((node as any).symbol).replace(/^".*"\./, "");
        const argumentIds: string[] = context.getArguments().map((arg: BaseType) => arg.getId());

        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
    }
}
