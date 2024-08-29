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
  applyToUpdateRecorder,
  InsertChange,
} from '@schematics/angular/utility/change';
import { join, normalize } from 'path';
import * as prettier from 'prettier';

import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import * as ts from 'typescript';
export function ngAdd(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const libraryPackageJsonPath = join(
      normalize('./node_modules/@iapps/ng-dhis2-shell'),
      'package.json'
    );
    if (!tree.exists(libraryPackageJsonPath)) {
      throw new SchematicsException(`Could not find ${libraryPackageJsonPath}`);
    }

    const libraryPackageJsonContent = tree
      .read(libraryPackageJsonPath)
      ?.toString('utf-8');
    if (!libraryPackageJsonContent) {
      throw new SchematicsException(`Unable to read ${libraryPackageJsonPath}`);
    }

    const libraryPackageJson = JSON.parse(libraryPackageJsonContent);
    const peerDependencies = libraryPackageJson.peerDependencies || {};

    for (const [pkg, version] of Object.entries(peerDependencies)) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: pkg,
        version: version as string,
      });
      context.logger.info(`Added peer dependency: ${pkg}@${version}`);
    }
    context.addTask(new NodePackageInstallTask());

    /**
     * Add app wrapper component
     */
    context.logger.info('Adding application wrapper component...');
    const appWrapperPath = './src/app/app-wrapper.component.ts';

    if (!tree.exists(appWrapperPath)) {
      tree.create(
        appWrapperPath,
        `import { ComponentPortal } from '@angular/cdk/portal';
        import { Component } from '@angular/core';
        import { NgDhis2ShellWrapper } from '@iapps/ng-dhis2-shell';
        import { AppComponent } from './app.component'

        @Component({
          selector: 'app-root',
          template: '<ng-dhis2-shell (shellHasLoaded)="onReady()"></ng-dhis2-shell>',
          styleUrl: './app.component.scss',
        })
        export class AppWrapperComponent extends NgDhis2ShellWrapper {
          override componentPortal: ComponentPortal<any> = new ComponentPortal(
            AppComponent
          );
        }`
      );
    }

    formatFile(tree, appWrapperPath);

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
        'AppWrapperComponent',
        './app-wrapper.component'
      )
    );

    /**
     * Replace AppComponent with AppWrapperComponent as starting component
     */
    context.logger.info('Replacing bootstraping component...');
    const appModuleNodes = getSourceNodes(appModuleSource);

    // Find the @NgModule decorator
    const ngModuleDecorator = appModuleNodes.find((node) => {
      return (
        ts.isDecorator(node) &&
        ts.isCallExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.getText() === 'NgModule'
      );
    });

    if (!ngModuleDecorator) {
      throw new SchematicsException(
        `@NgModule decorator not found in ${appModuleSource}.`
      );
    }

    // Find the object literal expression within the @NgModule decorator
    const ngModuleMetadata = (ngModuleDecorator as any).expression.arguments[0];

    if (!ts.isObjectLiteralExpression(ngModuleMetadata)) {
      throw new SchematicsException(
        `Invalid @NgModule metadata in ${appModuleSource}.`
      );
    }

    // Find the bootstrap property
    const bootstrapProperty = ngModuleMetadata.properties.find((prop) => {
      return (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.getText() === 'bootstrap'
      );
    });

    if (!bootstrapProperty) {
      throw new SchematicsException(
        `bootstrap property not found in @NgModule decorator.`
      );
    }

    if (!ts.isArrayLiteralExpression((bootstrapProperty as any).initializer)) {
      throw new SchematicsException(
        `bootstrap property is not an array in @NgModule decorator.`
      );
    }

    const bootstrapArray = (bootstrapProperty as any).initializer;

    // Find the old component in the bootstrap array
    const oldComponentNode = bootstrapArray.elements.find((element: any) => {
      return ts.isIdentifier(element) && element.getText() === 'AppComponent';
    });

    if (!oldComponentNode) {
      throw new SchematicsException(
        `AppComponent not found in bootstrap array.`
      );
    }

    // Remove the old component
    const oldComponentStart = oldComponentNode.getStart();
    const oldComponentEnd = oldComponentNode.getEnd();
    appModuleRecorder.remove(
      oldComponentStart,
      oldComponentEnd - oldComponentStart
    );

    // Insert the new component
    const newComponentChange = new InsertChange(
      modulePath,
      oldComponentStart,
      'AppWrapperComponent'
    );
    appModuleRecorder.insertLeft(
      newComponentChange.pos,
      newComponentChange.toAdd
    );

    tree.commitUpdate(appModuleRecorder);

    formatFile(tree, modulePath);

    /**
     * Updating app component
     */

    context.logger.info(
      'Updating App component to serve as inner root component...'
    );

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

    const appComponentNodes: ts.Node[] = getSourceNodes(appComponentSource);

    if (!appComponentNodes) {
      throw new SchematicsException(
        `Contents for ${appComponentPath} could not be evaluated`
      );
    }

    // Find the @Component decorator
    const componentDecorator = appComponentNodes.find((node) => {
      return (
        ts.isDecorator(node) &&
        ts.isCallExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.getText() === 'Component'
      );
    });

    if (!componentDecorator) {
      throw new SchematicsException(
        `@Component decorator not found in ${appComponentPath}.`
      );
    }

    // Find the object literal expression within the @Component decorator
    const componentMetadata = (componentDecorator as any).expression
      .arguments[0];

    if (!ts.isObjectLiteralExpression(componentMetadata)) {
      throw new SchematicsException(
        `Invalid @Component metadata in ${appComponentPath}.`
      );
    }

    // Find the selector property
    const selectorProperty = componentMetadata.properties.find((prop) => {
      return (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.getText() === 'selector'
      );
    });

    if (!selectorProperty) {
      throw new SchematicsException(
        `Selector property not found in @Component decorator.`
      );
    }

    // Replace the existing selector value
    const selectorStart = (selectorProperty as any).initializer.getStart();
    const selectorEnd = (selectorProperty as any).initializer.getEnd();

    appComponentRecorder.remove(selectorStart, selectorEnd - selectorStart);
    appComponentRecorder.insertLeft(selectorStart, `'app-root-content'`);

    tree.commitUpdate(appComponentRecorder);

    formatFile(tree, appComponentPath);

    /**
     * Updating ts config
     */

    context.logger.info(
      'Updating tsconfig file with react based configurations'
    );

    const tsConfigPath = './tsconfig.json';

    if (!tree.exists(tsConfigPath)) {
      throw new SchematicsException(`The file ${tsConfigPath} doesn't exists`);
    }

    const tsConfigContent = tree.read(tsConfigPath)?.toString('utf-8');

    if (!tsConfigContent) {
      throw new SchematicsException(
        `Unable to read tsconfig.json at ${tsConfigPath}`
      );
    }

    // Remove comments before parsing
    const tsConfigWithoutComments = removeJsonComments(tsConfigContent);

    // Parse the tsconfig.json content without comments
    const tsConfigJson = JSON.parse(tsConfigWithoutComments);

    // Modify the compilerOptions section
    tsConfigJson.compilerOptions = {
      ...tsConfigJson.compilerOptions,
      jsx: 'react',
      skipLibCheck: true,
      skipDefaultLibCheck: true,
    };

    // Convert the modified JSON back to a string
    const updatedTsConfigContent = JSON.stringify(tsConfigJson, null, 2);

    context.logger.info(`Saving modified tsconfig....`);

    // Overwrite the tsconfig.json file with the updated content
    tree.overwrite(tsConfigPath, updatedTsConfigContent);

    context.logger.info(`Updated tsconfig.json at ${tsConfigPath}`);

    // const tsConfigRecorder = tree.beginUpdate(tsConfigPath);

    // const tsConfigText = tree.read(tsConfigPath);

    // if (tsConfigText == null) {
    //   throw new SchematicsException(`The file ${tsConfigPath} doesn't exists`);
    // }

    // const tsConfigSource = ts.createSourceFile(
    //   tsConfigPath,
    //   tsConfigText.toString('utf-8'),
    //   ts.ScriptTarget.Latest,
    //   true
    // );

    // const tsConfigNodes: ts.Node[] = getSourceNodes(tsConfigSource);

    // const compilerOptionsNodePosition = tsConfigNodes
    //   .map((node) => findCompilerOptionsNodePosition(node))
    //   .filter((position) => position)[0];

    // if (!compilerOptionsNodePosition) {
    //   throw new SchematicsException(
    //     `Contents for ${tsConfigPath} could not be evaluated`
    //   );
    // }

    // const tsChange = new InsertChange(
    //   tsConfigPath,
    //   compilerOptionsNodePosition - 1,
    //   `,"jsx": "react","skipLibCheck": true,"skipDefaultLibCheck": true`
    // );

    // tsConfigRecorder.insertLeft(tsChange.pos, tsChange.toAdd);

    // tree.commitUpdate(tsConfigRecorder);

    /**
     * Add manifest.webapp
     */
    const manifestWebappPath = './manifest.webapp';
    const packageJsonContent = tree.read('./package.json')!.toString('utf-8');

    const packageJsonObject = JSON.parse(packageJsonContent);

    if (!tree.exists(manifestWebappPath)) {
      tree.create(
        manifestWebappPath,
        JSON.stringify(
          {
            version: packageJsonObject?.version,
            name: packageJsonObject?.name,
            description: '',
            appType: 'APP',
            launch_path: 'index.html',
            icons: {
              '16': 'assets/icons/icon-72x72.png',
              '48': 'assets/icons/icon-96x96.png',
              '128': 'assets/icons/icon-128x128.png',
            },
            developer: {
              name: '',
              url: '',
            },
            default_locale: 'en',
            activities: {
              dhis: {
                href: '../../../',
              },
            },
            authorities: [],
          },
          null,
          2
        )
      );
    }

    /**
     * Add manifest in assets
     */

    return;
  };
}

// function findCompilerOptionsNodePosition(node: ts.Node): number | undefined {
//   if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
//     const objectLiteral = node as ts.ObjectLiteralExpression;

//     const property = (objectLiteral.properties || []).find(
//       (property) =>
//         property.name && property.name.getText() === '"compilerOptions"'
//     );

//     return property
//       ?.getChildren()
//       .find((propChild) => {
//         return propChild.kind === ts.SyntaxKind.ObjectLiteralExpression;
//       })
//       ?.getEnd();
//   }

//   return undefined;
// }

function removeJsonComments(content: string): string {
  // Regex pattern to match single-line (//) and multi-line (/* */) comments
  const pattern = /\/\/.*?$|\/\*.*?\*\//g;
  return content.replace(pattern, '');
}

function formatFile(tree: Tree, filePath: string): void {
  const fileContent = tree.read(filePath)?.toString('utf-8');

  if (!fileContent) {
    throw new SchematicsException(
      `The file ${filePath} couldn't be read for formatting.`
    );
  }

  const formatted = prettier.format(fileContent, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });

  tree.overwrite(filePath, formatted);
}
