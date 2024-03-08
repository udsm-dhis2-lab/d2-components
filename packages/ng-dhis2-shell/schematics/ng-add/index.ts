// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addDeclarationToModule,
  addImportToModule,
  getSourceNodes,
  insertImport,
} from '@schematics/angular/utility/ast-utils';
import {
  InsertChange,
  applyToUpdateRecorder,
} from '@schematics/angular/utility/change';

import * as ts from 'typescript';
export function ngAdd(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('Adding library module to the app...');
    const modulePath = './src/app/app.module.ts';

    if (!tree.exists(modulePath)) {
      throw new SchematicsException(`The file ${modulePath} doesn't exists`);
    }
    const appModuleRecorder = tree.beginUpdate(modulePath);

    const text = tree.read(modulePath);

    if (text == null) {
      throw new SchematicsException(`The file ${modulePath} doesn't exists`);
    }

    const appModuleSource = ts.createSourceFile(
      modulePath,
      text.toString(),
      ts.ScriptTarget.Latest,
      true
    );

    const moduleToImport = 'AppShellModule';

    const appShellModuleImport = insertImport(
      appModuleSource,
      modulePath,
      moduleToImport,
      '@iapps/ng-dhis2-shell'
    );

    const [appShellNgModuleImport] = addImportToModule(
      appModuleSource,
      modulePath,
      [
        moduleToImport,
        `forRoot({
        pwaEnabled: false,
        isDevMode: true,
      })`,
      ].join('.'),
      ''
    );

    applyToUpdateRecorder(appModuleRecorder, [
      appShellModuleImport,
      appShellNgModuleImport,
    ]);

    applyToUpdateRecorder(
      appModuleRecorder,
      addDeclarationToModule(
        appModuleSource,
        modulePath,
        'AppComponentContent',
        './app.component'
      )
    );

    tree.commitUpdate(appModuleRecorder);

    /**
     * Updating app component
     */

    const appComponentPath = './src/app/app.component.ts';

    if (!tree.exists(appComponentPath)) {
      throw new SchematicsException(
        `The file ${appComponentPath} doesn't exists`
      );
    }

    const appComponentRecorder = tree.beginUpdate(appComponentPath);

    const appComponentText = tree.read(appComponentPath);

    if (appComponentText == null) {
      throw new SchematicsException(
        `The file ${appComponentPath} doesn't exists`
      );
    }

    const appComponentSource = ts.createSourceFile(
      appComponentPath,
      appComponentText.toString('utf-8'),
      ts.ScriptTarget.Latest,
      true
    );

    let appComponentNodes: ts.Node[] = getSourceNodes(appComponentSource);

    if (!appComponentNodes) {
      throw new SchematicsException(
        `Contents for ${appComponentPath} could not be evaluated`
      );
    }

    const appComponentClassNode = appComponentNodes.find(
      (node: ts.Node) => node.kind === ts.SyntaxKind.ClassDeclaration
    );

    if (!appComponentClassNode) {
      throw new SchematicsException(
        `Expected at least a class in ${appComponentPath}`
      );
    }

    const appComponentContentChange = new InsertChange(
      appComponentPath,
      0,
      `import { ComponentPortal } from '@angular/cdk/portal';
      import { Component, OnInit } from '@angular/core';
      import { NgDhis2ShellWrapper } from '@iapps/ng-dhis2-shell';
      
      @Component({
        selector: 'app-root',
        template: '<ng-dhis2-shell (shellHasLoaded)="onReady()"></ng-dhis2-shell>'
      })
      export class AppComponent extends NgDhis2ShellWrapper {
        override componentPortal: ComponentPortal<any> = new ComponentPortal(
          AppComponentContent
        );
      }
      
      @Component({
        selector: 'app-root-content',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss'],
      })
      export class AppComponentContent {}`
    );

    appComponentRecorder
      .remove(0, appComponentClassNode.getEnd())
      .insertLeft(
        appComponentContentChange.pos,
        appComponentContentChange.toAdd
      );

    tree.commitUpdate(appComponentRecorder);

    /**
     * Updating ts config
     */

    const tsConfigPath = './tsconfig.json';

    if (!tree.exists(tsConfigPath)) {
      throw new SchematicsException(`The file ${tsConfigPath} doesn't exists`);
    }

    const tsConfigRecorder = tree.beginUpdate(tsConfigPath);

    const tsConfigText = tree.read(tsConfigPath);

    if (tsConfigText == null) {
      throw new SchematicsException(`The file ${tsConfigPath} doesn't exists`);
    }

    const tsConfigSource = ts.createSourceFile(
      tsConfigPath,
      tsConfigText.toString('utf-8'),
      ts.ScriptTarget.Latest,
      true
    );

    const tsConfigNodes: ts.Node[] = getSourceNodes(tsConfigSource);

    const compilerOptionsNodePosition = tsConfigNodes
      .map((node) => findCompilerOptionsNodePosition(node))
      .filter((position) => position)[0];

    if (!compilerOptionsNodePosition) {
      throw new SchematicsException(
        `Contents for ${tsConfigPath} could not be evaluated`
      );
    }

    const tsChange = new InsertChange(
      tsConfigPath,
      compilerOptionsNodePosition - 1,
      `,"jsx": "react","skipLibCheck": true,"skipDefaultLibCheck": true`
    );

    tsConfigRecorder.insertLeft(tsChange.pos, tsChange.toAdd);

    tree.commitUpdate(tsConfigRecorder);

    /**
     * Add manifest.webapp
     */
    const manifestWebappPath = './manifest.webapp';
    const packageJsonContent = tree.read('./package.json')!.toString('utf-8');

    const packageJsonObject = JSON.parse(packageJsonContent);

    if (!tree.exists(manifestWebappPath)) {
      tree.create(
        manifestWebappPath,
        `{
        "version": "${packageJsonObject?.version}",
        "name": "${packageJsonObject?.name}",
        "description": "",
        "appType": "APP",
        "launch_path": "index.html",
        "icons": {
          "16": "assets/icons/icon-72x72.png",
          "48": "assets/icons/icon-96x96.png",
          "128": "assets/icons/icon-128x128.png"
        },
        "developer": {
          "name": "",
          "url": ""
        },
        "default_locale": "en",
        "activities": {
          "dhis": {
            "href": "../../../"
          }
        },
        "authorities": []
      }`
      );
    }

    /**
     * Add manifest in assets
     */

    // const workspace = await getWorkspace(tree);
    // console.log(workspace.projects.get(packageJsonObject?.name));

    context.logger.info('Installing dependencies...');
    context.addTask(new NodePackageInstallTask({}));

    return;
  };
}

function findCompilerOptionsNodePosition(node: ts.Node): number | undefined {
  if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    const objectLiteral = node as ts.ObjectLiteralExpression;

    const property = (objectLiteral.properties || []).find(
      (property) =>
        property.name && property.name.getText() === '"compilerOptions"'
    );

    return property
      ?.getChildren()
      .find((propChild) => {
        return propChild.kind === ts.SyntaxKind.ObjectLiteralExpression;
      })
      ?.getEnd();
  }

  return undefined;
}
