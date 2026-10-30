# The home bar

Static cocktail recipe app at `/cocktails/`. No build, API keys or dependencies.

## Inventory

Edit `ingredients.md`, then reload the app after deploying the change:

- `* Vodka` means in stock.
- `* Cointreau [x]` (or `[X]`) means usually stocked but currently unavailable.
- Standard Markdown checkboxes (`* [x] Cointreau`) also work, with the same out-of-stock meaning.
- Duplicate names are combined without regard to case. If either duplicate is out of stock, the combined item is out of stock.

The app fetches the file on every load. Shopping-list checkmarks are saved only in this browser; they do not update the inventory. Download the list as a text file for shopping.

## Recipes

`recipes.json` holds 32 selected Difford’s Guide recipes, checked 31 October 2026. Each recipe links to its original page. The latest ten additions use only required ingredients already listed in the inventory, whether in stock or out of stock; garnishes and optional extras are checked separately by the drink maker. The Aviation uses the Savoy specification without crème de violette; the John Collins uses London dry gin. Measures use Difford’s 30 ml/fl oz convention; brand names are generalised and instructions summarised. Optional additions and garnishes are shown separately and excluded from availability. Ice and water are assumed available; sugar and agave syrups are not. Egg inventory maps to pasteurised egg white in recipes that call for egg white. Generic whisky is deliberately not assumed to be bourbon or Scotch. Recipes specifying rye use the Rye Whiskey inventory entry; check the recipe method for the specified proof. Mint leaves in a Mojito are required mixing ingredients and count toward availability.

Margarita is the straight-up blanco-tequila version; Margarita on the rocks uses reposado tequila. The Mai Tai follows Trader Vic’s recipe, the Manhattan is the sweet split-bourbon-and-rye version, the Sazerac is New Orleans style, and the Corpse Reviver #2 follows the Savoy recipe. Each links to the exact Difford’s variant used.

## Preview

From the parent repository, run `python3 -m http.server 8000` and open `http://localhost:8000/cocktails/`.

## GitHub Pages

Publish these files with the site’s existing GitHub Pages workflow. All app URLs are relative, so the app also works beneath a repository URL. This folder is a separate Git submodule: commit and push its changes to `JackDunstan/cocktails`, then update the submodule reference in the parent repository. The parent’s existing `.github/workflows/static.yml` already initialises submodules before uploading the site. No commits or pushes are performed by this implementation.
